'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { calculateItemPricing } from '@/lib/tax';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductImage } from '@/components/ui/product-image';
import { TrustScoreCard } from '@/components/ui/trust-score-card';
import {
  ArrowLeft,
  ShieldCheck,
  ShoppingCart,
  Clock,
  Truck,
  Building2,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react';

export default function ProductDetailClient() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();

  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!id || id === 'placeholder') {
        setLoadingProduct(false);
        return;
      }

      setLoadingProduct(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Product not found');
        }
        setProduct(data);
        setQuantity(Math.max(1, Number(data.min_order_quantity || 1)));
      } catch (err: any) {
        setErrorMessage(err?.message || 'Unable to load product details');
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-2 gap-8">
          <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-24 w-full rounded bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            <div className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (!product || errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 text-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {errorMessage || 'Product Not Found'}
        </h2>
        <Button variant="outline" onClick={() => router.push('/marketplace')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const moq = Math.max(1, Number(product.min_order_quantity || 1));
  const unitPrice = Number(product.base_price || 0);
  const pricing = calculateItemPricing(unitPrice, Math.max(moq, quantity), product.category);
  const seller = product.seller || {};

  const handlePlaceOrder = () => {
    if (quantity < moq) {
      toast.error(`Minimum order quantity is ${moq} ${product.unit || 'units'}.`);
      return;
    }
    sessionStorage.setItem(
      'pendingOrder',
      JSON.stringify({
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        seller_id: product.seller_id,
        quantity,
        unit_price: unitPrice,
        subtotal: pricing.taxableAmount,
        gst_rate: pricing.gstRate,
        gst_amount: pricing.gstAmount,
        total_amount: pricing.totalAmount,
      })
    );
    if (!user) {
      router.push('/auth/login?redirect=/order/confirm');
      return;
    }
    router.push('/order/confirm');
  };

  const handleAddToCart = async () => {
    if (quantity < moq) {
      toast.error(`Minimum order quantity is ${moq} ${product.unit || 'units'}.`);
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
    } catch {
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-600 dark:text-zinc-400 pl-0 mb-5 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Button>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Product Visual & Supplier Verification */}
          <div className="lg:col-span-6 space-y-5">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                category={product.category}
                aspect="4/3"
                showFallbackLabel
              />
            </div>

            {/* Supplier Profile & Genuine Trust Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Supplied By
                    </p>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {seller.business_name || seller.name || 'Verified Wholesaler'}
                    </h3>
                    {seller.location && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {seller.location}
                      </p>
                    )}
                  </div>
                </div>
                {seller.gst_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" /> GST Verified
                  </span>
                )}
              </div>

              <TrustScoreCard
                compact
                trustScore={seller.trust_score}
                gstVerified={seller.gst_verified}
                totalOrders={seller.total_orders}
                successfulOrders={seller.successful_orders}
                disputedOrders={seller.disputed_orders}
                isLowTrust={seller.is_low_trust}
                businessName={seller.business_name || seller.name}
              />
            </div>
          </div>

          {/* Right: Specs & Order Configuration */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                {product.category}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 leading-relaxed">
                {product.description || 'Direct B2B wholesale inventory protected by Tradigoo Escrow.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5">
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-zinc-400">Unit Price</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  ₹{unitPrice.toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-500"> /{product.unit || 'unit'}</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5">
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-zinc-400">Min Order Qty</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {moq} {product.unit || 'units'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-zinc-400">Applicable GST</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {pricing.gstRate}% GST
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-900 dark:text-blue-200 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>24-hour inspection window after delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>OTP-verified courier handover</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-xs space-y-5">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-2 block">
                  Order Quantity ({product.unit || 'units'}) · Min {moq}
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setQuantity((q) => Math.max(moq, q - 1))}
                    disabled={quantity <= moq}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min={moq}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="h-11 text-center text-base font-bold tabular-nums"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>Subtotal ({quantity} × ₹{unitPrice.toLocaleString('en-IN')})</span>
                  <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                    ₹{pricing.taxableAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                  <span>GST ({pricing.gstRate}%)</span>
                  <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                    ₹{pricing.gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 dark:text-white">Escrow Total</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{pricing.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={quantity < moq}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Place Escrow Order
                </Button>
                <Button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={quantity < moq || addingToCart}
                  variant="outline"
                  className="h-12 px-5 font-semibold"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
