'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export default function AITradeBrain() {
  const { user } = useAuth();
  const [insight, setInsight] = useState<string>('');
  const role = user?.role || 'retailer';

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch('/api/trade-brain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'wholesale market sourcing and escrow margins', role }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setInsight(
            data.recommendation ||
              data.insight ||
              'Compare GST-verified wholesalers by MOQ and landed ₹ cost—every payment remains protected in Tradigoo Escrow until OTP and 24-hour inspection.'
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setInsight(
            'Compare GST-verified suppliers by MOQ and delivered ₹ cost—all orders remain protected in Tradigoo Escrow through your 24-hour inspection window.'
          );
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [role]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-2xs flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Tradigoo Trade Intelligence
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Live catalog &amp; margin briefing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('tradigoo:open-assistant'))}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            Ask Assistant <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {insight ? (
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm">{insight}</p>
        ) : (
          <div className="space-y-2 py-1">
            <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
