'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import CryptoJS from 'crypto-js';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { TrustScoreCard } from '@/components/ui/trust-score-card';
import { ProductFormDialog } from '@/components/inventory/product-form-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Plus,
  Package,
  IndianRupee,
  Truck,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  QrCode,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export function SellerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [inventory, setInventory] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const userId = user?.id;

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [prodRes, ordRes] = await Promise.all([
        fetch(`/api/products?sellerId=${encodeURIComponent(userId)}&includeInactive=true&limit=100`, {
          credentials: 'include',
        }),
        fetch('/api/orders?role=wholesaler&limit=50', {
          credentials: 'include',
        }),
      ]);

      if (!prodRes.ok) {
        const err = await prodRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to load wholesaler catalog');
      }

      const prodData = await prodRes.json();
      setInventory(Array.isArray(prodData) ? prodData : []);

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(Array.isArray(ordData) ? ordData : []);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load wholesaler dashboard.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!user?.id) return;
    loadData();

    const supabase = createClient();
    const channel = supabase
      .channel(`wholesaler-dashboard-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload: any) => {
          const newOrder = payload.new as any;
          if (newOrder?.status === 'payment_in_escrow') {
            toast.success('New Escrow Order Received', {
              description: 'Payment secured in escrow. Prepare parcel & download QR label.',
              duration: 6000,
            });
          }
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadData]);

  const stats = useMemo(() => {
    const activeSkus = inventory.filter((p) => p.is_active !== false).length;
    const pendingEscrow = orders.filter((o) =>
      ['payment_in_escrow', 'PAYMENT_HELD', 'ORDER_CREATED'].includes(o.status)
    );
    const totalRevenue = orders
      .filter((o) => !['cancelled', 'CANCELLED', 'refunded', 'REFUNDED'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      activeSkus,
      totalSkus: inventory.length,
      pendingCount: pendingEscrow.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: pendingEscrow.slice(0, 6),
    };
  }, [inventory, orders]);

  const handleDownloadQr = async (order: any) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const payload = JSON.stringify({
        id: order.id,
        p: order.product?.name || 'Wholesale Parcel',
        q: order.quantity,
        t: new Date().toISOString(),
        salt: crypto.randomUUID(),
      });
      const encrypted = CryptoJS.AES.encrypt(payload, 'TRADIGOO_SECRET_KEY_PROD').toString();
      const verifyUrl = `${baseUrl}/verify-qr?data=${encodeURIComponent(encrypted)}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' },
      });

      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `Tradigoo-QR-${order.id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Verification QR label downloaded.');
    } catch {
      toast.error('Failed to generate QR label.');
    }
  };

  const handleMarkShipped = async (orderId: string) => {
    setBusyOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'shipped',
          pickup_verified: true,
          courier_proof: {
            pickup_time: new Date().toISOString(),
            method: 'wholesaler_handover',
          },
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Could not mark order shipped');

      toast.success('Order marked Ready for Pickup & Shipped.');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'shipped' } : o))
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order status');
    } finally {
      setBusyOrderId(null);
    }
  };

  if (loading && inventory.length === 0 && orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 sm:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 w-72 rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-pulse"
              />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
              Wholesaler Portal
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {user?.business_name || user?.name || 'Supplier Dashboard'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Manage wholesale catalog listings, product imagery, and escrow order dispatch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="h-10 text-xs font-semibold whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ProductFormDialog onSuccess={loadData}>
              <Button className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl whitespace-nowrap">
                <Plus className="w-4 h-4 mr-1.5" /> Add Product
              </Button>
            </ProductFormDialog>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={loadData}>
              Retry
            </Button>
          </div>
        )}

        {/* Real DB KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Order Volume
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
              Across {stats.totalOrders} total wholesale orders
            </p>
          </div>

          <div
            onClick={() => router.push('/inventory')}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 hover:border-blue-500/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Catalog Listings
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.activeSkus}
              <span className="text-sm font-normal text-slate-400 dark:text-zinc-500">
                {' '}
                / {stats.totalSkus} SKUs
              </span>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
              Manage prices, photos &amp; MOQ →
            </p>
          </div>

          <div
            onClick={() => router.push('/orders-received')}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 hover:border-blue-500/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Ready for Dispatch
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.pendingCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Escrow-funded orders awaiting handover
            </p>
          </div>
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Escrow Orders Queue */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Pending Escrow Dispatch Queue
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Print verification QR and hand over to courier
                  </p>
                </div>
                <Link
                  href="/orders-received"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  All Orders →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <Table className="min-w-[540px]">
                  <TableHeader className="bg-slate-50 dark:bg-zinc-950/60">
                    <TableRow className="border-slate-200 dark:border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold">Order</TableHead>
                      <TableHead className="text-xs font-semibold">Product</TableHead>
                      <TableHead className="text-xs font-semibold">Amount</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.pendingOrders.length > 0 ? (
                      stats.pendingOrders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40"
                        >
                          <TableCell className="font-mono text-xs text-slate-600 dark:text-zinc-300">
                            <Link href={`/order/${order.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                              #{order.id.slice(0, 8)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <ProductImage
                                src={order.product?.image_url}
                                alt={order.product?.name || 'Product'}
                                category={order.product?.category}
                                aspect="square"
                                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[170px]">
                                  {order.product?.name || 'Wholesale Item'}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                                  Qty: {order.quantity}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-slate-900 dark:text-white tabular-nums">
                            ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadQr(order)}
                                className="h-8 px-2.5 text-xs"
                              >
                                <QrCode className="w-3.5 h-3.5 mr-1" /> QR
                              </Button>
                              <Button
                                size="sm"
                                disabled={busyOrderId === order.id}
                                onClick={() => handleMarkShipped(order.id)}
                                className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <Truck className="w-3.5 h-3.5 mr-1" />
                                {busyOrderId === order.id ? 'Updating...' : 'Ship'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-sm text-slate-500 dark:text-zinc-400">
                          No escrow orders waiting for dispatch right now.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Wholesaler's Real Listed Products */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Your Latest Catalog Items
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Active SKUs visible to retailers across Tradigoo
                  </p>
                </div>
                <Link
                  href="/inventory"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  Open Inventory →
                </Link>
              </div>

              {inventory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    Your catalog is empty
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Add your first wholesale product with photos and MOQ pricing to start receiving orders.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventory.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href="/inventory"
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-blue-500/40 transition-colors"
                    >
                      <ProductImage
                        src={item.image_url}
                        alt={item.name}
                        category={item.category}
                        aspect="square"
                        className="w-12 h-12 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                          ₹{Number(item.base_price || 0).toLocaleString('en-IN')} / {item.unit || 'unit'} · MOQ {item.min_order_quantity}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Trust Score + Quick Links */}
          <div className="space-y-5">
            <TrustScoreCard
              trustScore={user?.trust_score}
              gstVerified={user?.gst_verified}
              totalOrders={user?.total_orders}
              successfulOrders={user?.successful_orders}
              disputedOrders={user?.disputed_orders}
              isLowTrust={user?.is_low_trust}
              businessName={user?.business_name}
            />

            {!user?.gst_verified && (
              <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-purple-700 text-white p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-100">
                  <ShieldCheck className="w-4 h-4" />
                  Compliance Priority
                </div>
                <h3 className="text-base font-bold">Verify GST to Unlock Buyer Trust</h3>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Retailers filter by GST-verified suppliers in the marketplace. Submit your GSTIN for review.
                </p>
                <Button
                  onClick={() => router.push('/profile?tab=trust')}
                  className="w-full bg-white text-blue-800 hover:bg-blue-50 font-semibold text-xs"
                >
                  Complete GST Verification <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}

            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Quick Actions
              </h3>
              <button
                type="button"
                onClick={() => router.push('/inventory')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                  <Package className="w-4 h-4 text-blue-600" /> Manage Inventory
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/orders-received')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                  <Clock className="w-4 h-4 text-purple-600" /> All Orders Received
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/profile?tab=trust')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Trust &amp; GST Settings
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
