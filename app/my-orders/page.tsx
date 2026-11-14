'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { Package, ArrowRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { authFetch } from '@/lib/auth-fetch';

const QRScanner = dynamic(
  () => import('@/components/qr-scanner').then((mod) => mod.QRScanner),
  {
    loading: () => (
      <Button size="sm" variant="outline" disabled>
        Loading Scanner...
      </Button>
    ),
    ssr: false,
  }
);

function MyOrdersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/orders?role=buyer&userId=${encodeURIComponent(user.id)}&limit=50`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load orders.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const res = await authFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not confirm order');
      toast.success('Order completed and escrow released.');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order status.');
    }
  };

  const handleQrDelivered = async (orderId: string) => {
    try {
      const res = await authFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Could not mark parcel delivered');
      toast.success('Delivery confirmed via QR scan.');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify delivery status.');
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = (status || '').toLowerCase();
    switch (normalized) {
      case 'order_created':
      case 'payment_pending':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
      case 'payment_in_escrow':
      case 'payment_held':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20';
      case 'shipped':
      case 'courier_verified':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'delivered':
      case 'completed':
      case 'payment_released':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'disputed':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Package className="w-7 h-7 text-blue-600" />
            My Orders
          </h1>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {errorMsg ? (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-zinc-900 p-8 text-center">
            <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{errorMsg}</p>
            <Button onClick={fetchOrders}>Retry</Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Package className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5">No orders placed yet</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">
              Browse the marketplace to place your first escrow-protected wholesale order.
            </p>
            <Button onClick={() => router.push('/marketplace')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                onClick={() => router.push(`/order/${order.id}`)}
                className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-4 sm:p-5 hover:border-blue-500/40 transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shrink-0">
                    <ProductImage
                      src={order.product?.image_url}
                      alt={order.product?.name || 'Product'}
                      category={order.product?.category}
                      aspect="square"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                      <span className="font-mono">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors truncate">
                      {order.product?.name || 'Wholesale Product'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      Supplier: <span className="font-medium text-slate-700 dark:text-zinc-300">{order.seller?.business_name || order.seller?.name || 'Verified Supplier'}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto shrink-0">
                    <Badge className={`${getStatusColor(order.status)} border px-2.5 py-0.5 text-xs uppercase`}>
                      {(order.status || '').replace(/_/g, ' ')}
                    </Badge>
                    <div className="font-bold text-slate-900 dark:text-white text-base tabular-nums">
                      ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500 ml-1.5">
                        ({order.quantity} {order.product?.unit || 'units'})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'shipped' && (
                        <QRScanner
                          orderId={order.id}
                          expectedDetails={{}}
                          onVerify={(success) => {
                            if (success) {
                              handleQrDelivered(order.id);
                            }
                          }}
                        />
                      )}

                      {(order.status === 'delivered' || order.status === 'inspection') && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs"
                            onClick={() => handleConfirmDelivery(order.id)}
                          >
                            Confirm Quality
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 h-8 text-xs"
                            onClick={() => router.push(`/dispute/${order.id}`)}
                          >
                            Report Issue
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 hidden sm:block shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <AuthGuard>
      <MyOrdersContent />
    </AuthGuard>
  );
}
