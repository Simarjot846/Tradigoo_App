'use client';

import React from 'react';
import { ShieldCheck, Zap, Globe, Lock, BarChart3, Search } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Escrow Payment Protection',
    desc: 'Buyer funds stay locked securely in Tradigoo Escrow until OTP-verified handover and physical inspection pass.',
    tone: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
  },
  {
    icon: Search,
    title: 'Fast Catalog Discovery',
    desc: 'Search across wholesale SKUs by product name, category, verified supplier, MOQ, and delivered cost.',
    tone: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
  },
  {
    icon: Lock,
    title: 'GST & Supplier Verification',
    desc: 'Every wholesaler profile tracks verified GST compliance, order fulfillment rate, and dispute history.',
    tone: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    icon: Globe,
    title: 'QR & Courier Tracking',
    desc: 'Track bulk shipments from dispatch QR scan through courier verification to retailer OTP confirmation.',
    tone: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10',
  },
  {
    icon: Zap,
    title: 'Trade Brain Assistant',
    desc: 'Instant B2B sourcing guidance, GST slab calculations, and margin comparisons built into your workflow.',
    tone: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    icon: BarChart3,
    title: 'Structured Dispute Resolution',
    desc: 'Raise inspection disputes with photo/video evidence and clear operations ticket tracking.',
    tone: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
            Built for B2B Trade
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight text-slate-900 dark:text-white">
            Everything you need to source and sell at scale
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A structured operating system replacing fragmented phone orders with transparent pricing and verified settlements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${feature.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
