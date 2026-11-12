'use client';

import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { calculateCartTotals, calculateItemPricing } from '@/lib/tax';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProductImage } from '@/components/ui/product-image';
import { ArrowLeft, ShoppingCart, Trash2, ArrowRight, ShieldCheck, Building2, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function CartContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCartItems(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Could not load cart items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const updateQuantity = async (item: any, newQuantity: number) => {
    const moq = Math.max(1, Number(item.product?.min_order_quantity || 1));
    if (newQuantity > 0 && newQuantity < moq) {
      toast.info(`Minimum order quantity for ${item.product?.name} is ${moq}.`);
      return;
    }

    const oldItems = [...cartItems];
    setCartItems((items) =>
      items.map((it) => (it.id === item.id ? { ...it, quantity: newQuantity } : it))
    );

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, quantity: newQuantity }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Update failed');
      fetchCart();
    } catch (error: any) {
      setCartItems(oldItems);
      toast.error(error?.message || 'Failed to update quantity.');
    }
  };

  const removeItem = async (id: string) => {
    const oldItems = [...cartItems];
    setCartItems((items) => items.filter((item) => item.id !== id));
    try {
      const res = await fetch(`/api/cart?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Item removed from cart.');
    } catch {
      setCartItems(oldItems);
      toast.error('Could not remove item.');
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success('Order placed securely in Tradigoo Escrow.');
        if (data.orderIds && data.orderIds.length === 1) {
          router.push(`/order/${data.orderIds[0]}`);
        } else {
          router.push('/my-orders');
        }
      } else {
        toast.error(data.error || 'Checkout failed.');
      }
    } catch {
      toast.error('Something went wrong during checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const pricingSummary = calculateCartTotals(
    cartItems.map((item) => ({
      quantity: Number(item.quantity || 0),
      product: {
        base_price: Number(item.product?.base_price || 0),
        category: item.product?.category,
      },
    }))
  );

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-slate-500 dark:text-zinc-400 pl-0 mb-2"
            onClick={() => router.push('/marketplace')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Sourcing
          </Button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-blue-600" />
            Wholesale Procurement Cart
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4 max-w-3xl">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">Your cart is empty</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">
              Browse verified suppliers in the Marketplace to start an escrow-protected order.
            </p>
            <Button onClick={() => router.push('/marketplace')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => {
                const moq = Math.max(1, Number(item.product?.min_order_quantity || 1));
                const itemPricing = calculateItemPricing(
                  Number(item.product?.base_price || 0),
                  Number(item.quantity || 0),
                  item.product?.category
                );
                const supplierName =
                  item.product?.seller?.business_name || item.product?.seller?.name || 'Verified Supplier';

                return (
                  <Card
                    key={item.id}
                    className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shrink-0">
                        <ProductImage
                          src={item.product?.image_url}
                          alt={item.product?.name || 'Product'}
                          category={item.product?.category}
                          aspect="square"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {item.product?.category || 'Wholesale'} · GST {itemPricing.gstRate}%
                        </p>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {item.product?.name || 'Wholesale Product'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{supplierName}</span>
                          {item.product?.seller?.gst_verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </p>
                        <p className="text-xs font-mono text-slate-600 dark:text-zinc-300 mt-1 tabular-nums">
                          ₹{Number(item.product?.base_price || 0).toLocaleString('en-IN')} / {item.product?.unit || 'unit'} · MOQ {moq}
                        </p>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-950 rounded-lg p-1 border border-slate-200 dark:border-zinc-800">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            disabled={item.quantity <= moq}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <span className="font-mono text-sm font-semibold w-10 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                            ₹{itemPricing.taxableAmount.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-rose-600"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="lg:col-span-4">
              <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-6 sticky top-20 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h2>

                <div className="space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      ₹{pricingSummary.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {pricingSummary.breakdown.map((slab) => (
                    <div key={slab.rate} className="flex justify-between">
                      <span>GST ({slab.rate}%)</span>
                      <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                        ₹{slab.gstAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">₹0</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white">
                    <span>Escrow Total</span>
                    <span className="tabular-nums">₹{pricingSummary.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                  className="w-full mt-6 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {checkoutLoading ? 'Processing...' : 'Place Escrow Order'}
                  {!checkoutLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>

                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Funds protected in escrow until delivery OTP
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthGuard>
      <CartContent />
    </AuthGuard>
  );
}
