'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TrustScoreCard } from '@/components/ui/trust-score-card';
import { ProductImage } from '@/components/ui/product-image';
import ProductCard from '@/components/marketplace/product-card';
import TopWholesalers from '@/components/dashboard/TopWholesalers';
import AITradeBrain from '@/components/dashboard/AITradeBrain';
import { PRODUCT_CATEGORIES } from '@/components/inventory/product-form-dialog';
import {
  Search,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  ShieldCheck,
  X,
} from 'lucide-react';

export function BuyerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const loadCatalog = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await fetch('/api/products?limit=8', {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Could not load wholesale catalog');
      }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setProductsError(err?.message || 'Unable to reach product catalog.');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadRecentOrders = useCallback(async () => {
    if (!user?.id) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    try {
      const res = await fetch('/api/orders?role=retailer&limit=4', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRecentOrders(Array.isArray(data) ? data : []);
      }
    } catch {
      // Keep non-blocking on home dashboard
    } finally {
      setOrdersLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCatalog();
    loadRecentOrders();
  }, [loadCatalog, loadRecentOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    router.push(q ? `/marketplace?search=${encodeURIComponent(q)}` : '/marketplace');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Hero Search & Welcome Banner */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-8 shadow-sm border border-slate-800">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Escrow-Protected B2B Wholesale Sourcing</span>
              {user?.business_name && (
                <>
                  <span className="text-blue-400">·</span>
                  <span className="text-white font-semibold">{user.business_name}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name || 'Retail Partner'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Search verified bulk inventory by product name, category, or wholesaler and place GST-compliant orders with 24-hour inspection escrow.
            </p>

            {/* Prominent Dashboard Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search rice, spices, oils, electronics, or supplier name..."
                  className="h-11 pl-10 pr-9 bg-white text-slate-900 border-0 placeholder:text-slate-400 rounded-xl text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shrink-0"
              >
                Search Catalog
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.dispatchEvent(new CustomEvent('tradigoo:open-assistant'))}
                className="h-11 px-4 border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl shrink-0"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-purple-300" />
                Trade AI
              </Button>
            </form>

            {/* Category Quick Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 no-scrollbar">
              {PRODUCT_CATEGORIES.slice(0, 7).map((cat) => (
                <Link
                  key={cat}
                  href={`/marketplace?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust + Recent Orders + Trade Brain Strip */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4">
            <TrustScoreCard
              trustScore={user?.trust_score}
              gstVerified={user?.gst_verified}
              totalOrders={user?.total_orders}
              successfulOrders={user?.successful_orders}
              disputedOrders={user?.disputed_orders}
              isLowTrust={user?.is_low_trust}
              businessName={user?.business_name}
            />
          </div>

          <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Recent Escrow Orders
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Track deliveries and 24-hour inspection confirmations
                  </p>
                </div>
              </div>
              <Link
                href="/my-orders"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap"
              >
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 text-center space-y-2 my-auto">
                <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  No wholesale orders yet
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Explore verified wholesalers below to place your first escrow-protected order.
                </p>
                <Button
                  size="sm"
                  onClick={() => router.push('/marketplace')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs mt-1"
                >
                  Browse Marketplace
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${order.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductImage
                        src={order.product?.image_url}
                        alt={order.product?.name || 'Order item'}
                        category={order.product?.category}
                        aspect="square"
                        className="w-11 h-11 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {order.product?.name || 'Wholesale Order'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                          #{order.id.slice(0, 8)} · {order.quantity} {order.product?.unit || 'units'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 capitalize">
                        {String(order.status || '').replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recommended Wholesale Products */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Wholesale Products in Stock
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Direct factory &amp; distributor listings with transparent MOQ pricing
              </p>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              View Full Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-white dark:bg-zinc-900 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Failed to load wholesale listings
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                {productsError}
              </p>
              <Button size="sm" variant="outline" onClick={loadCatalog}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center space-y-2">
              <p className="text-base font-bold text-slate-900 dark:text-white">
                No active wholesale products available yet
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Suppliers are adding inventory shortly. Check back or ask Trade Brain AI for sourcing help.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} addToCart={addToCart} />
              ))}
            </div>
          )}
        </section>

        {/* Market Intelligence Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AITradeBrain />
          <TopWholesalers />
        </section>
      </div>
    </div>
  );
}
