'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/auth-fetch';
import { calculateItemPricing } from '@/lib/tax';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, Building2, MapPin } from 'lucide-react';
import { ProductImage } from '@/components/ui/product-image';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/auth/auth-guard';

function OrderConfirmContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const data = sessionStorage.getItem('pendingOrder');
        if (!data) {
          router.replace('/marketplace');
          return;
        }

        const parsed = JSON.parse(data);
        const qty = Math.max(1, Number(parsed.quantity || 1));
        const unitPrice = Number(parsed.unit_price || 0);
        const computedPricing = calculateItemPricing(unitPrice, qty, parsed.category);
        const normalizedOrder = {
          ...parsed,
          quantity: qty,
          unit_price: unitPrice,
          subtotal: Number(parsed.subtotal ?? computedPricing.taxableAmount),
          gst_rate: Number(parsed.gst_rate ?? computedPricing.gstRate),
          gst_amount: Number(parsed.gst_amount ?? computedPricing.gstAmount),
          total_amount: Number(parsed.total_amount ?? computedPricing.totalAmount),
          expected_profit: Number(parsed.expected_profit ?? Math.round(computedPricing.taxableAmount * 0.18)),
        };

        setOrderData(normalizedOrder);

        const isProductUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          parsed.product_id || ''
        );
        let productData: any = null;

        if (isProductUuid) {
          const prodRes = await fetch(`/api/products/${encodeURIComponent(parsed.product_id)}`, {
            cache: 'no-store',
          });
          if (prodRes.ok) {
            productData = await prodRes.json();
          }
        }

        if (!productData) {
          productData = {
            id: parsed.product_id,
            name: parsed.product_name,
            base_price: unitPrice,
            unit: parsed.unit || 'unit',
            seller_id: parsed.seller_id || null,
            min_order_quantity: qty,
            category: parsed.category || 'General',
            image_url: parsed.image_url || null,
          };
        }

        setProduct(productData);
        if (productData.seller) {
          setSeller(productData.seller);
        }
      } catch (err: any) {
        console.error('Error loading order confirmation details:', err);
        setFetchError('Unable to load order details.');
      }
    }

    if (user) fetchDetails();
  }, [router, user]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 bg-slate-50 text-slate-900 dark:text-white gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold">{fetchError}</h2>
        <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
      </div>
    );
  }

  if (!user || !orderData || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 bg-slate-50 gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Preparing escrow order summary...</p>
      </div>
    );
  }

  const displaySeller = seller || {
    business_name: 'Verified Wholesaler',
    name: 'Supplier Partner',
    location: 'India',
    trust_score: 500,
  };
  const sellerDisplayName = displaySeller.business_name || displaySeller.name || 'Verified Wholesaler';
  const sellerInitial = sellerDisplayName.charAt(0).toUpperCase() || 'W';

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      const response = await authFetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: orderData.total_amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error('Payment initiation failed: ' + (data.error || response.statusText));
        setProcessing(false);
        return;
      }

      const completeOrderCreation = async () => {
        try {
          const orderRes = await authFetch('/api/order/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              buyer_id: user.id,
              seller_id: product.seller_id,
              product_id: product.id,
              quantity: orderData.quantity,
              unit_price: product.base_price || orderData.unit_price,
              total_amount: orderData.total_amount,
            }),
          });

          const orderResult = await orderRes.json();

          if (!orderRes.ok || !orderResult?.id) {
            toast.error(orderResult.error || 'Order creation failed. Please try again.');
            setProcessing(false);
            return;
          }

          sessionStorage.removeItem('pendingOrder');
          sessionStorage.setItem('lastOrderId', orderResult.id);
          await refreshUser().catch(() => {});
          toast.success('Order placed securely in Tradigoo Escrow!');
          router.push(`/order/${orderResult.id}`);
        } catch (createErr: any) {
          toast.error('Order creation error: ' + (createErr?.message || 'Unknown error'));
          setProcessing(false);
        }
      };

      if (data.is_mock) {
        toast.info('Securing funds in Tradigoo Escrow...');
        await completeOrderCreation();
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway unavailable. Please check your connection.');
        setProcessing(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: data.amount,
        currency: data.currency,
        name: 'Tradigoo',
        description: `Order for ${orderData.product_name}`,
        order_id: data.id,
        handler: async function () {
          await completeOrderCreation();
        },
        prefill: {
          name: user?.name || user?.email,
          email: user?.email,
          contact: user?.phone || '9999999999',
        },
        theme: { color: '#1E3A8A' },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error('Payment processing error: ' + (err?.message || 'Unexpected error'));
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-slate-50 dark:text-zinc-100 text-slate-900 pb-20">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-500 dark:text-zinc-400 pl-0 gap-2 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Confirm Your Escrow Order
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Review product, GST breakdown, and supplier trust before placing your order.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductImage
                      src={product?.image_url}
                      alt={orderData.product_name}
                      category={product?.category}
                      aspect="square"
                      className="w-14 h-14 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-slate-500 dark:text-zinc-400 text-xs">Product</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {orderData.product_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        ₹{Number(orderData.unit_price).toLocaleString('en-IN')} / {product?.unit || orderData.unit || 'unit'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-500 dark:text-zinc-400 text-xs">Quantity</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                      {orderData.quantity} {product?.unit || orderData.unit || 'units'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>Taxable Subtotal</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      ₹{Number(orderData.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                    <span>GST ({orderData.gst_rate}%)</span>
                    <span className="font-medium text-slate-900 dark:text-white tabular-nums">
                      ₹{Number(orderData.gst_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {orderData.expected_profit > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Estimated Retail Margin</span>
                      <span className="font-semibold tabular-nums">
                        + ₹{Number(orderData.expected_profit).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">Escrow Total</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                      ₹{Number(orderData.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Supplier Details
                </h2>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                  Trust Score: {displaySeller.trust_score ?? 500}
                </Badge>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {sellerInitial}
                </div>
                <div>
                  <p className="font-bold text-base text-slate-900 dark:text-white">{sellerDisplayName}</p>
                  {displaySeller.name && displaySeller.name !== sellerDisplayName && (
                    <p className="text-sm text-slate-500 dark:text-zinc-400">{displaySeller.name}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {displaySeller.location || 'India'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-500/20 shadow-sm sticky top-20">
              <div className="w-11 h-11 bg-[#1E3A8A] rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>

              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Escrow Protection Active</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mb-4 leading-relaxed">
                Your payment is held safely in Tradigoo Escrow. Funds are released to the supplier only after:
              </p>

              <ul className="space-y-2.5 mb-5">
                {[
                  'Goods delivered to your store',
                  'You verify delivery with 6-digit OTP',
                  '24-hour quality inspection passes',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 mb-5">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 text-[11px] font-semibold uppercase tracking-wider mb-0.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Payment Method
                </div>
                <div className="text-sm text-slate-900 dark:text-white font-semibold">
                  Secure Escrow Transfer
                </div>
              </div>

              <Button
                type="button"
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Securing Order...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 tabular-nums">
                    Confirm &amp; Pay ₹{Number(orderData.total_amount).toLocaleString('en-IN')}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderConfirmPage() {
  return (
    <AuthGuard>
      <OrderConfirmContent />
    </AuthGuard>
  );
}
