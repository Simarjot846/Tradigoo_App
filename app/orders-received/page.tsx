'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/auth-fetch';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ProductImage } from '@/components/ui/product-image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Package,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  X,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'payment_in_escrow', label: 'In Escrow' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'completed', label: 'Completed' },
  { id: 'disputed', label: 'Disputed' },
];

function OrdersReceivedContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/orders?role=wholesaler&limit=100', {
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to fetch received orders');
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Unable to load orders received.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const normalizedStatus = String(o.status || '').toLowerCase();
      if (filter !== 'ALL' && normalizedStatus !== filter.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return (
        (o.id || '').toLowerCase().includes(q) ||
        (o.product?.name || '').toLowerCase().includes(q) ||
        (o.buyer?.business_name || o.buyer?.name || '').toLowerCase().includes(q)
      );
    });
  }, [orders, filter, searchQuery]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white mb-1 pl-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Orders Received
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Manage incoming wholesale orders, generate verification QR labels, and dispatch shipments.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="h-9 text-xs font-semibold shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Search + Status Chips */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, product, or buyer..."
              className="pl-10 pr-9 h-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  filter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            <Button size="sm" variant="outline" onClick={loadOrders}>
              Retry
            </Button>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-3">
          {loading && orders.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-28 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-slate-900 dark:text-white font-bold">No matching orders</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                No incoming orders match your selected status or search term.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={loadOrders} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdate }: { order: any; onUpdate: () => void }) {
  const statusBadgeClass = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'shipped' || s === 'courier_verified')
      return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    if (s === 'delivered' || s === 'completed')
      return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    if (s === 'cancelled' || s === 'disputed')
      return 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
    return 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-4 min-w-0">
          <ProductImage
            src={order.product?.image_url}
            alt={order.product?.name || 'Order product'}
            category={order.product?.category}
            aspect="square"
            className="w-14 h-14 rounded-xl border border-slate-200 dark:border-zinc-800 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-slate-900 dark:text-white font-bold text-base truncate">
                {order.product?.name || `Order #${order.id.slice(0, 8)}`}
              </h3>
              <span
                className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold capitalize ${statusBadgeClass(
                  order.status
                )}`}
              >
                {String(order.status || '').replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              <span className="font-mono">#{order.id.slice(0, 8)}</span> ·{' '}
              {new Date(order.created_at).toLocaleDateString()} · Buyer:{' '}
              {order.buyer?.business_name || order.buyer?.name || 'Retailer'} · Qty:{' '}
              <span className="tabular-nums font-medium">{order.quantity}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800">
          <div className="text-left md:text-right">
            <p className="text-[11px] uppercase font-semibold text-slate-400">Order Total</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/order/${order.id}`}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              Details <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <ManageOrderDialog order={order} onUpdate={onUpdate} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function ManageOrderDialog({ order, onUpdate }: { order: any; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!open) return;
    const generateQR = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const verifyUrl = `${baseUrl}/verify/${order.id}`;
        const url = await QRCode.toDataURL(verifyUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        });
        setQrImageUrl(url);
      } catch (e) {
        console.error('QR Gen Error', e);
      }
    };
    generateQR();
  }, [open, order.id]);

  const handleMarkShipped = async () => {
    setUpdating(true);
    try {
      const res = await authFetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
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
      if (!res.ok) throw new Error(payload.error || 'Failed to update status');

      toast.success('Order marked Ready for Pickup & Shipped.');
      setOpen(false);
      onUpdate();
    } catch (e: any) {
      toast.error(e?.message || 'Could not update order');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadLabel = () => {
    if (!qrImageUrl) return;
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `Tradigoo-Label-${order.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Verification QR label downloaded.');
  };

  const isDispatchable = ['payment_in_escrow', 'payment_held', 'order_created'].includes(
    String(order.status || '').toLowerCase()
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setShowLabel(false);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
          Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Order #{order.id.slice(0, 8)}</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            {order.product?.name} · Qty: {order.quantity}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!showLabel ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-slate-500 mb-1">Status</p>
                  <p className="font-semibold capitalize">
                    {String(order.status || '').replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                  <p className="text-slate-500 mb-1">Buyer</p>
                  <p className="font-semibold truncate">
                    {order.buyer?.business_name || order.buyer?.name || 'Retailer'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <Button
                  type="button"
                  onClick={() => setShowLabel(true)}
                  variant="outline"
                  className="w-full justify-start h-12 gap-3"
                >
                  <Package className="w-4 h-4 text-blue-600" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">View Verification QR Label</div>
                    <div className="text-[11px] text-slate-500">Download QR parcel seal</div>
                  </div>
                </Button>

                {isDispatchable ? (
                  <Button
                    type="button"
                    disabled={updating}
                    onClick={handleMarkShipped}
                    className="w-full justify-start h-12 bg-emerald-600 hover:bg-emerald-700 text-white gap-3"
                  >
                    <Truck className="w-4 h-4" />
                    <div className="text-left">
                      <div className="text-xs font-semibold">
                        {updating ? 'Marking Shipped...' : 'Mark Ready for Pickup / Shipped'}
                      </div>
                      <div className="text-[11px] text-emerald-100">
                        Confirms handover to logistics partner
                      </div>
                    </div>
                  </Button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Current status:{' '}
                      <strong className="capitalize">
                        {String(order.status || '').replace(/_/g, ' ').toLowerCase()}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 text-slate-900 w-full max-w-xs text-center space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-sm">TRADIGOO VERIFIED</span>
                  <span className="text-xs font-mono text-slate-500">#{order.id.slice(0, 6)}</span>
                </div>
                {qrImageUrl && (
                  <img
                    src={qrImageUrl}
                    alt="Verification QR"
                    className="w-40 h-40 mx-auto object-contain"
                  />
                )}
                <p className="text-xs font-semibold">{order.product?.name}</p>
                <p className="text-[11px] text-slate-500">
                  Qty: {order.quantity} · Buyer: {order.buyer?.business_name || 'Retailer'}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setShowLabel(false)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleDownloadLabel}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download QR
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersReceivedPage() {
  return (
    <AuthGuard>
      <OrdersReceivedContent />
    </AuthGuard>
  );
}
