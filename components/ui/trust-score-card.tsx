'use client';

import { ShieldCheck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreCardProps {
  trustScore?: number | null;
  gstVerified?: boolean | null;
  totalOrders?: number | null;
  successfulOrders?: number | null;
  disputedOrders?: number | null;
  isLowTrust?: boolean | null;
  businessName?: string | null;
  compact?: boolean;
  className?: string;
}

export function TrustScoreCard({
  trustScore = 500,
  gstVerified = false,
  totalOrders = 0,
  successfulOrders = 0,
  disputedOrders = 0,
  isLowTrust = false,
  businessName,
  compact = false,
  className,
}: TrustScoreCardProps) {
  const score = Math.min(1000, Math.max(0, Number(trustScore ?? 500)));
  const orders = Math.max(0, Number(totalOrders ?? 0));
  const successful = Math.max(0, Number(successfulOrders ?? 0));
  const disputed = Math.max(0, Number(disputedOrders ?? 0));
  const successRate = orders > 0 ? Math.round((successful / orders) * 100) : null;

  const tier =
    isLowTrust || score < 350
      ? { label: 'Under Review', color: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' }
      : score >= 750 && gstVerified
      ? { label: 'Verified Premier', color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' }
      : orders === 0
      ? { label: 'New Partner (Baseline)', color: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' }
      : { label: 'Verified Standard', color: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' };

  if (compact) {
    return (
      <div className={cn('rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-3.5', className)}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className={cn('w-4 h-4 shrink-0', tier.color)} />
            <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200 truncate">
              {businessName ? `${businessName} Reliability` : 'Trust & Reliability'}
            </span>
          </div>
          <span className={cn('text-xs font-bold tabular-nums shrink-0', tier.color)}>
            {score} / 1000
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden mb-2">
          <div className={cn('h-full rounded-full transition-all', tier.bar)} style={{ width: `${Math.round((score / 1000) * 100)}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
          <span>{gstVerified ? 'GST Verified' : 'GST Unverified'}</span>
          <span>
            {orders === 0 ? 'Pending order history' : `${successRate}% fulfilled (${orders} orders)`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Trust & Reliability Score
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {score}
            </span>
            <span className="text-sm text-slate-400 dark:text-zinc-500 tabular-nums">/ 1000</span>
          </div>
        </div>
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold', tier.bg, tier.color)}>
          {isLowTrust ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {tier.label}
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden mb-4">
        <div
          className={cn('h-full rounded-full transition-all duration-500', tier.bar)}
          style={{ width: `${Math.round((score / 1000) * 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center mb-3">
        <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-2.5 border border-slate-100 dark:border-zinc-800">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">GST Status</p>
          <p className={cn('text-xs font-semibold mt-0.5 flex items-center justify-center gap-1', gstVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
            {gstVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {gstVerified ? 'Verified' : 'Pending'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-2.5 border border-slate-100 dark:border-zinc-800">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Fulfillment</p>
          <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {successRate !== null ? `${successRate}%` : 'No orders'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-2.5 border border-slate-100 dark:border-zinc-800">
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Disputes</p>
          <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5 tabular-nums">
            {disputed} / {orders}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
        {orders === 0
          ? 'Baseline score starts at 500/1000. Completing escrow deliveries and GST verification increases your reliability tier.'
          : 'Calculated from verified GST compliance, completed escrow deliveries, and dispute resolution history.'}
      </p>
    </div>
  );
}
