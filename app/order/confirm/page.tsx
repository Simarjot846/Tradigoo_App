'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldCheck, CreditCard, CheckCircle2, AlertCircle, Building2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { ProductImage } from '@/components/ui/product-image';
import { toast } from 'sonner';

import { AuthGuard } from '@/components/auth/auth-guard';

function OrderConfirmContent() {
  const { user } = useAuth();
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
          router.push('/marketplace');
          return;
        }

        const parsed = JSON.parse(data);
        setOrderData(parsed);

        const isProductUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.product_id || '');
        let productData: any = null;

        if (isProductUuid) {
          const supabase = createClient();
          const { data: dbProduct } = await supabase
            .from('products')
            .select('*')
            .eq('id', parsed.product_id)
            .maybeSingle();

          if (dbProduct) {
            productData = dbProduct;
          }
        }

        if (!productData) {
          productData = {
            id: parsed.product_id,
            name: parsed.product_name,
            base_price: parsed.unit_price,
            unit: 'unit',
            seller_id: parsed.seller_id || null,
            min_order_quantity: parsed.quantity,
            category: 'General',
            image_url: parsed.image_url || null,
          };
        }

        setProduct(productData);

        const sellerId = productData.seller_id;
        const isSellerUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId || '');

        if (isSellerUuid) {
          const supabase = createClient();
          const { data: sellerData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sellerId)
            .maybeSingle();

          if (sellerData) {
            setSeller(sellerData);
          }
        }
      } catch (err: any) {
        console.error("Error loading order confirmation details:", err);
        setFetchError("Unable to load product details.");
      }
    }

    if (user) fetchDetails();
  }, [router, user]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 bg-background text-zinc-900 dark:text-white gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">{fetchError}</h2>
        <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
      </div>
    );
  }

  if (!user || !orderData || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-950 bg-background transition-colors duration-300 gap-3">
        <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-800 border-t-green-500 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Preparing order summary...</p>
      </div>
    );
  }

  const displaySeller = seller || {
    business_name: "Verified Wholesaler",
    name: "Supplier Partner",
    location: "India",
    trust_score: 500
  };

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Payment gateway unavailable. Are you online?');
        setProcessing(false);
        return;
      }

      // 1. Create Order on Server
      const response = await fetch('/api/payment/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: orderData.total_amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error("Payment initiation failed: " + (data.error || response.statusText));
        setProcessing(false);
        return;
      }

      // 2. Open Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: data.amount,
        currency: data.currency,
        name: "Tradigoo",
        description: `Order for ${orderData.product_name}`,
        image: "https://tradigoo.com/logo.png",
        order_id: data.id,
        handler: async function (response: any) {
          try {
            // 3. Payment Success -> Create Order via Server API
            const orderRes = await fetch('/api/order/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                buyer_id: user.id,
                seller_id: product.seller_id,
                product_id: product.id,
                quantity: orderData.quantity,
                unit_price: product.base_price || orderData.unit_price,
                total_amount: orderData.total_amount
              })
            });

            const orderResult = await orderRes.json();

            if (!orderRes.ok || !orderResult?.id) {
              console.error("Order creation failed:", orderResult);
              toast.error(orderResult.error || "Order creation failed. Please contact support.");
              setProcessing(false);
              return;
            }

            sessionStorage.removeItem('pendingOrder');
            sessionStorage.setItem('lastOrderId', orderResult.id);
            toast.success("Order placed successfully in escrow!");
            router.push(`/order/${orderResult.id}`);
          } catch (createErr: any) {
            console.error("Order create network error:", createErr);
            toast.error("Order creation error: " + (createErr.message || "Unknown error"));
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || user?.email,
          email: user?.email,
          contact: "9999999999"
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          }
        }
      };

      if (data.is_mock) {
        toast.info("Simulating secure escrow transfer...");
        await options.handler({ razorpay_payment_id: "mock_pay_" + Date.now() });
        return;
      }

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error("An error occurred during payment processing: " + err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-zinc-950 bg-background dark:text-zinc-100 text-foreground relative overflow-hidden selection:bg-green-500/30 transition-colors duration-300">
      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none text-left">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-green-900/10 via-zinc-950 to-zinc-950 hidden dark:block" />
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen hidden dark:block" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen hidden dark:block" />
      </div>



      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 pl-0 gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Config
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
            Confirm Your Order
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">Review details before initiating secure escrow payment.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Summary */}
            <div
              
              
              
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-sm dark:shadow-none"
            >
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductImage
                      src={product?.image_url}
                      alt={orderData.product_name}
                      category={product?.category}
                      aspect="square"
                      className="w-12 h-12 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">Product</p>
                      <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate">{orderData.product_name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-0.5">Total Quantity</p>
                    <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tabular-nums">{orderData.quantity} units</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 space-y-3">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Unit Price</span>
                    <span className="text-zinc-800 dark:text-zinc-200">₹{orderData.unit_price}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Expected Profit</span>
                    <span>+ ₹{orderData.expected_profit.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex justify-between items-center">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">₹{orderData.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            {displaySeller && (
              <div
                
                
                
                className="p-6 rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 backdrop-blur-xl shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Supplier Details
                  </h2>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    Trust Score: {displaySeller.trust_score}
                  </Badge>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                    {displaySeller.business_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-zinc-900 dark:text-white">{displaySeller.business_name}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">{displaySeller.name}</p>
                    <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      {displaySeller.location}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Payment & Security */}
          <div className="lg:col-span-1 space-y-6">
            <div
              
              
              
              className="p-6 rounded-3xl bg-white dark:bg-gradient-to-br dark:from-blue-900/20 dark:to-zinc-900/50 border border-blue-500/10 dark:border-blue-500/20 backdrop-blur-xl relative overflow-hidden shadow-lg dark:shadow-none"
            >
              <div className="absolute top-0 right-0 p-32 bg-blue-500/5 dark:bg-blue-500/10 blur-[60px] rounded-full mix-blend-screen pointer-events-none" />

              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>

                <h3 className="font-bold text-lg text-zinc-900 dark:text-white mb-2">Escrow Protection Active</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  Your payment is held securely in an escrow account. Funds are only released to the supplier after:
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    'Goods delivered to your location',
                    'You verify delivery with OTP',
                    'Quality check passed (24h window)'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    <CreditCard className="w-3 h-3" />
                    Payment Method
                  </div>
                  <div className="text-zinc-900 dark:text-white font-medium">Secure Escrow Transfer</div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/20"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Pay ₹{orderData.total_amount.toLocaleString()}
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-zinc-500 mt-4">
                  By paying, you agree to Tradigoo's <span className="text-zinc-300 underline cursor-pointer">Terms of Service</span>
                </p>
              </div>
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
