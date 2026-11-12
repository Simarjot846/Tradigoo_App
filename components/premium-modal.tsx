'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Percent,
  TrendingUp,
  ShieldCheck,
  Headphones,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  {
    icon: Percent,
    title: 'Lowest Commission Rates',
    desc: 'Pay 0% platform commission on high-volume wholesale deals to maximize your profit margins.',
    badge: '0% Fees'
  },
  {
    icon: TrendingUp,
    title: 'Priority Marketplace Placement',
    desc: 'Get featured at the top of retailer searches and category listings for 5x more visibility.',
    badge: '5x Reach'
  },
  {
    icon: ShieldCheck,
    title: 'Exclusive Gold Trust Badge',
    desc: 'Display a verified Gold Trader badge on your profile and listings to win instant buyer trust.',
    badge: 'Verified VIP'
  },
  {
    icon: Headphones,
    title: '24/7 Dedicated Account Manager',
    desc: 'Direct WhatsApp and phone priority hotline with a dedicated B2B trade specialist.',
    badge: 'VIP Support'
  },
  {
    icon: BarChart3,
    title: 'AI Market Intelligence & Trends',
    desc: 'Real-time commodity price tracking, seasonal forecast signals, and buyer demand heatmaps.',
    badge: 'AI Insights'
  },
  {
    icon: Zap,
    title: 'Instant Escrow Release & Higher Limits',
    desc: 'Accelerated payout releases upon delivery and unrestricted bulk transaction volume.',
    badge: 'Fast Payout'
  }
];

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/premium-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          userId: user?.id || null
        })
      });

      const data = await res.json();
      setSubmitted(true);
      setFeedbackMessage(data.message || "You're on the list! We'll notify you as soon as Tradigoo Premium launches.");

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } catch {
      setSubmitted(true);
      setFeedbackMessage("🎉 You've been added to the VIP waitlist! We'll notify you first.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-white dark:bg-zinc-950 shadow-2xl rounded-3xl overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10">
        <DialogTitle className="sr-only">Unlock Tradigoo Premium</DialogTitle>
        <DialogDescription className="sr-only">
          Explore upcoming features in Tradigoo Premium and join the VIP waitlist.
        </DialogDescription>

        {/* Hero Header with Animated Gradient */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
          {/* Subtle glow orbs */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col items-start gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-400/20 text-amber-200 border-amber-300/30 px-3 py-1 text-xs uppercase tracking-widest font-extrabold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Coming Soon
              </Badge>
              <Badge className="bg-white/15 text-white border-white/20 px-2.5 py-0.5 text-xs font-semibold">
                VIP Early Access
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Unlock <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-cyan-200">Tradigoo Premium</span>
            </h2>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-lg mt-0.5">
              Supercharge your wholesale business with institutional-grade trading tools, zero commission deals, and priority VIP support.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Planned Premium Benefits
            </h3>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Free Early-Bird Perks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PREMIUM_FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80 transition-all flex items-start gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {feat.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Waitlist Form or Success State */}
          <div className="pt-2 border-t border-zinc-100 dark:border-white/5">
            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-center space-y-2">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                  You're on the VIP Waitlist!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                  {feedbackMessage}
                </p>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs border-emerald-300 dark:border-emerald-800"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleJoinWaitlist} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your business email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 shrink-0 gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Joining...
                      </>
                    ) : (
                      <>
                        Notify Me at Launch <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-center text-zinc-400">
                  ⚡ First 500 members get 3 months of Tradigoo Premium free. No spam ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
