'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProductImage } from '@/components/ui/product-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  Truck,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';

const VideoRecorder = dynamic(
  () => import('@/components/video-recorder').then((mod) => mod.VideoRecorder),
  {
    loading: () => <div className="h-48 w-full bg-slate-200 dark:bg-zinc-900 animate-pulse rounded-xl" />,
    ssr: false,
  }
);

type TrackStatus =
  | 'payment_in_escrow'
  | 'shipped'
  | 'courier_verified'
  | 'delivered'
  | 'inspection'
  | 'completed'
  | 'disputed';

function normalizeTrackStatus(raw?: string): TrackStatus {
  const s = (raw || '').toLowerCase();
  if (s === 'order_created' || s === 'payment_pending' || s === 'payment_held' || s === 'payment_in_escrow') {
    return 'payment_in_escrow';
  }
  if (s === 'shipped') return 'shipped';
  if (s === 'courier_verified') return 'courier_verified';
  if (s === 'delivered') return 'delivered';
  if (s === 'inspection' || s === 'inspection_pending' || s === 'otp_confirmed') return 'inspection';
  if (s === 'completed' || s === 'payment_released') return 'completed';
  if (s === 'disputed') return 'disputed';
  return 'payment_in_escrow';
}

export default function OrderTrackingClient() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchOrder = useCallback(async () => {
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || id === 'placeholder') {
      setLoadingOrder(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, product:products(name, category, image_url, unit)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching order:', error);
      } else if (data) {
        setOrderData({
          ...data,
          product_name: data.product?.name || 'Wholesale Product',
          normalized_status: normalizeTrackStatus(data.status),
        });
      }
    } catch (e) {
      console.error('fetchOrder exception:', e);
    } finally {
      setLoadingOrder(false);
    }
  }, [params.id]);

  useEffect(() => {
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!loading && !user && id && id !== 'placeholder') {
      router.push('/auth/login?redirect=/order/' + id);
    }
  }, [user, loading, router, params.id]);

  useEffect(() => {
    const rawId = params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (user && id && id !== 'placeholder') fetchOrder();
  }, [params.id, user, fetchOrder]);

  if (loading || !user || loadingOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">Loading order details...</p>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-slate-500 dark:text-zinc-400 text-sm">
          We could not locate the details for this order.
        </p>
        <Button onClick={() => router.push('/my-orders')} className="bg-blue-600 hover:bg-blue-700 text-white">
          View My Orders
        </Button>
      </div>
    );
  }

  const currentStatus: TrackStatus =
    orderData.normalized_status || normalizeTrackStatus(orderData.status);

  const statusSteps: { status: TrackStatus; label: string; icon: any }[] = [
    { status: 'payment_in_escrow', label: 'Payment Secured', icon: ShieldCheck },
    { status: 'shipped', label: 'Ready for Pickup', icon: Package },
    { status: 'courier_verified', label: 'In Transit', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
    { status: 'inspection', label: 'Inspection', icon: Clock },
    { status: 'completed', label: 'Completed', icon: CheckCircle },
  ];

  const currentStepIndex = Math.max(
    0,
    statusSteps.findIndex((s) => s.status === currentStatus)
  );
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  const updateOrderViaApi = async (targetStatus: string, successToast: string) => {
    const res = await fetch(`/api/orders/${orderData.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: targetStatus }),
    });
    const payload = await res.json();
    if (!res.ok) {
      toast.error(payload?.error || 'Could not update order status.');
      return false;
    }
    toast.success(successToast);
    await fetchOrder();
    return true;
  };

  const handleReadyForPickup = () =>
    updateOrderViaApi('shipped', 'Order marked as ready for pickup.');

  const handleVerifyOtp = async () => {
    if (otp.trim() && (otp.trim() === orderData.otp || !orderData.otp)) {
      const ok = await updateOrderViaApi(
        'inspection',
        'Delivery OTP verified. 24-hour inspection started.'
      );
      if (ok) {
        setShowOtpDialog(false);
        setOtp('');
        setOtpError('');
      }
    } else {
      setOtpError('Invalid OTP. Please verify with the delivery code.');
    }
  };

  const handleConfirmQuality = async () => {
    const ok = await updateOrderViaApi(
      'completed',
      'Order completed and escrow released to supplier.'
    );
    if (ok) {
      await refreshUser();
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error('Please describe the issue first.');
      return;
    }

    setUploading(true);
    try {
      let evidenceUrl = '';
      if (videoBlob) {
        const formData = new FormData();
        formData.append('file', videoBlob, 'evidence.mp4');
        formData.append('orderId', orderData.id);

        const response = await fetch('/api/disputes/upload', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Evidence upload failed');
        evidenceUrl = result.url;
      }

      const supabase = createClient();
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'disputed',
          dispute_reason: disputeReason.trim(),
          dispute_evidence: evidenceUrl ? [evidenceUrl] : [],
        })
        .eq('id', orderData.id);

      if (orderError) throw orderError;

      toast.success('Dispute submitted for operations review.');
      await fetchOrder();
      setShowDisputeDialog(false);
      setVideoBlob(null);
      setDisputeReason('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit dispute.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-20">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/my-orders')}
            className="text-slate-500 dark:text-zinc-400 pl-0 gap-2 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Order #{orderData.id.slice(0, 8).toUpperCase()}
                </h1>
                <Badge variant="outline" className="font-mono text-xs">
                  {new Date(orderData.created_at).toLocaleDateString('en-IN')}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400">{orderData.product_name}</p>
            </div>
            <Badge className={`px-3 py-1 border ${getStatusColor(currentStatus)}`}>
              {getStatusLabel(currentStatus)}
            </Badge>
          </div>
        </div>

        {/* 6-Step Progress Pipeline */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 mb-6 shadow-xs">
          <div className="mb-6 hidden md:block">
            <Progress value={progress} className="h-1.5 bg-slate-200 dark:bg-zinc-800" />
          </div>

          <div className="hidden md:grid md:grid-cols-6 gap-3">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.status} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-xl mb-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600'
                    } ${isCurrent ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-xs font-medium ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="md:hidden space-y-3">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm font-medium flex-1 ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Active</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {currentStatus === 'payment_in_escrow' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-500/30 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                      Payment Secured in Escrow
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 text-sm mb-4">
                      ₹{Number(orderData.total_amount || 0).toLocaleString('en-IN')} is held safely in escrow.{' '}
                      {user.role === 'wholesaler'
                        ? 'Pack the shipment and mark Ready for Pickup.'
                        : 'The supplier is preparing your order for dispatch.'}
                    </p>
                    {user.role === 'wholesaler' && (
                      <Button onClick={handleReadyForPickup} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Mark Ready for Pickup
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(currentStatus === 'shipped' || currentStatus === 'courier_verified') && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                      {currentStatus === 'shipped' ? 'Dispatched for Pickup' : 'Courier Verified & In Transit'}
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 text-sm mb-4">
                      Your wholesale shipment is moving through logistics. Once it arrives, verify your delivery OTP to begin the 24-hour inspection window.
                    </p>
                    {user.id === orderData.buyer_id && (
                      <Button onClick={() => setShowOtpDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Enter Delivery OTP
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(currentStatus === 'delivered' || currentStatus === 'inspection') && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-500/30 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                      24-Hour Quality Inspection Window
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 text-sm mb-4">
                      Inspect quantity and quality carefully. Confirm to release escrow payout, or raise a dispute if items are damaged.
                    </p>
                    {orderData.inspection_deadline && (
                      <p className="text-xs font-mono text-amber-700 dark:text-amber-400 mb-4">
                        Deadline: {new Date(orderData.inspection_deadline).toLocaleString('en-IN')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2.5">
                      <Button onClick={handleConfirmQuality} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Quality &amp; Release Escrow
                      </Button>
                      <Button
                        onClick={() => setShowDisputeDialog(true)}
                        variant="outline"
                        className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Report Issue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === 'completed' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-500/30 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">
                      Order Completed Successfully
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 text-sm">
                      Escrow payout of ₹{Number(orderData.total_amount || 0).toLocaleString('en-IN')} has been released to the supplier.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStatus === 'disputed' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-500/30 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1.5">Dispute Under Review</h3>
                    <p className="text-slate-600 dark:text-zinc-400 text-sm mb-3">
                      {orderData.dispute_reason || 'Dispute logged during inspection window.'}
                    </p>
                    <Button
                      onClick={() => router.push(`/dispute/${orderData.id}`)}
                      className="bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      View Dispute Details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shrink-0">
                  <ProductImage
                    src={orderData.product?.image_url}
                    alt={orderData.product_name}
                    category={orderData.product?.category}
                    aspect="square"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {orderData.product_name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Qty: {orderData.quantity} {orderData.product?.unit || 'units'}
                  </p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm border-t border-slate-100 dark:border-zinc-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{Number(orderData.total_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Date</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {new Date(orderData.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
              {currentStatus === 'completed' ? (
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={`/order/${orderData.id}/invoice`}>
                    <span>View GST Invoice</span>
                    <FileText className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <p className="text-xs text-slate-500 dark:text-zinc-400 text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
                  GST invoice unlocks upon order completion.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Delivery OTP</DialogTitle>
            <DialogDescription>
              Enter the 6-digit delivery verification code to begin your inspection window.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {orderData.otp && (
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-3.5 rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-blue-800 dark:text-blue-300">Delivery OTP:</span>
                <code className="text-base font-mono font-bold text-blue-700 dark:text-blue-400 tracking-wider">
                  {orderData.otp}
                </code>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="otp">6-Digit OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-xl tracking-[0.4em] h-12 font-mono"
              />
              {otpError && <p className="text-xs text-rose-600">{otpError}</p>}
            </div>
            <Button onClick={handleVerifyOtp} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Verify &amp; Start Inspection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Order Issue</DialogTitle>
            <DialogDescription>
              Describe the problem and optionally attach unboxing video evidence.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="dispute">Issue Description</Label>
              <Textarea
                id="dispute"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Describe damaged goods, quantity mismatch, or quality variance..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Video Evidence (Optional)</Label>
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <VideoRecorder onRecordingComplete={(blob) => setVideoBlob(blob)} />
              </div>
            </div>
            <Button
              onClick={handleRaiseDispute}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              disabled={uploading || !disputeReason.trim()}
            >
              {uploading ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getStatusColor(status: TrackStatus): string {
  const colors: Record<TrackStatus, string> = {
    payment_in_escrow: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400',
    shipped: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400',
    courier_verified: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400',
    delivered: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400',
    inspection: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
    disputed: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400',
  };
  return colors[status];
}

function getStatusLabel(status: TrackStatus): string {
  const labels: Record<TrackStatus, string> = {
    payment_in_escrow: 'Escrow Active',
    shipped: 'Ready for Pickup',
    courier_verified: 'In Transit',
    delivered: 'Delivered',
    inspection: 'Under Inspection',
    completed: 'Order Completed',
    disputed: 'Dispute Raised',
  };
  return labels[status];
}
