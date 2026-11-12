'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowRight,
  ShieldCheck,
  Search,
  PackageCheck,
  FileText,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { BrandLogo } from '@/components/ui/brand-logo';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

const FeaturesSection = dynamic(() =>
  import('@/components/landing/features-section').then((mod) => mod.FeaturesSection)
);
const Process = dynamic(() =>
  import('@/components/landing/process').then((mod) => mod.Process)
);
const CTASection = dynamic(() =>
  import('@/components/landing/cta-section').then((mod) => mod.CTASection)
);
const Footer = dynamic(() =>
  import('@/components/landing/footer').then((mod) => mod.Footer)
);

export default function LandingPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasCode = window.location.search.includes('code=');
    const hasHash =
      window.location.hash.includes('access_token=') ||
      window.location.hash.includes('code=');

    if (hasCode || hasHash) {
      import('@/lib/oauth-handler').then(async ({ processOAuthCallback }) => {
        try {
          const res = await processOAuthCallback(window.location.href);
          if (res.success) {
            await refreshUser();
            router.replace('/dashboard');
          }
        } catch (err) {
          console.warn('[Landing Page OAuth Error]:', err);
        }
      });
    }
  }, [router, refreshUser]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white overflow-x-hidden">
      {/* Single Clean Landing Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="focus:outline-none">
            <BrandLogo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-zinc-300">
            <Link href="/marketplace" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="#features" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="#pricing" className="hover:text-blue-600 dark:hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-700 dark:text-zinc-200 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 sm:px-5 h-9 sm:h-10 text-sm font-semibold shadow-xs"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 bg-gradient-to-b from-white via-slate-50 to-slate-100/80 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/60 border-b border-slate-200/70 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400 mb-3">
              B2B Wholesale Commerce &amp; Escrow Network
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-5">
              Direct wholesale sourcing,{' '}
              <span className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#6D28D9] dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                protected by escrow.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Connect with GST-verified Indian wholesalers and mills, compare transparent MOQ &amp; GST pricing, and pay securely through Tradigoo Escrow until OTP-verified delivery and inspection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm"
              >
                <Link href="/marketplace">
                  <Search className="w-4 h-4 mr-2" />
                  Browse Marketplace
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-7 rounded-xl border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white font-semibold text-base"
              >
                <Link href="/auth/signup">
                  Create Trade Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 pt-6 border-t border-slate-200 dark:border-zinc-800 text-left">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Escrow Hold</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Released post-inspection</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">GST Verified</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Transparent supplier KYC</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">OTP Delivery</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">QR &amp; courier verification</p>
              </div>
            </div>
          </div>

          {/* Clean Structured Trade Workflow Preview Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Tradigoo Trade Flow
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    Protected B2B Settlement
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3.5">
                {[
                  {
                    icon: Search,
                    title: 'Discover Verified Inventory',
                    desc: 'Filter by category, GST-verified suppliers, MOQ, and live bulk pricing.',
                  },
                  {
                    icon: PackageCheck,
                    title: 'Lock Funds in Escrow',
                    desc: 'Category-accurate GST invoicing with funds safeguarded during transit.',
                  },
                  {
                    icon: Truck,
                    title: 'QR & Delivery OTP Scan',
                    desc: 'Confirm dispatch and physical handover before the 24-hour inspection window.',
                  },
                  {
                    icon: FileText,
                    title: 'Automated GST & Payouts',
                    desc: 'Seamless settlement to wholesalers once inspection closes without dispute.',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <Process />

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
              Transparent Commerce
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Simple, Predictable Pricing
            </h2>
            <p className="text-slate-600 dark:text-zinc-400 max-w-xl mx-auto text-sm sm:text-base">
              No hidden markups. Full escrow protection on every wholesale order.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-7 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                  For Retailers &amp; Buyers
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Zero Platform Buyer Fees</h3>
                <p className="text-slate-600 dark:text-zinc-400 text-sm mb-5">
                  Source directly from suppliers at wholesale rates with escrow protection.
                </p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tabular-nums">
                  ₹0 <span className="text-sm font-normal text-slate-500">/ order fee</span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 dark:text-zinc-300 mb-7">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Direct wholesale MOQ pricing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> Escrow payment safeguard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> 24-hour physical inspection window</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" /> OTP-verified delivery &amp; GST invoices</li>
                </ul>
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold">
                <Link href="/auth/signup">Join as Retailer</Link>
              </Button>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">
                  For Wholesalers &amp; Mills
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">1.5% Settlement Fee</h3>
                <p className="text-slate-600 dark:text-zinc-400 text-sm mb-5">
                  Expand your retail reach across India with guaranteed escrow payouts.
                </p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tabular-nums">
                  1.5% <span className="text-sm font-normal text-slate-500">per settled order</span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700 dark:text-zinc-300 mb-7">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" /> Guaranteed settlement after delivery</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" /> GST verification &amp; Trust Score profile</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" /> Inventory &amp; QR dispatch management</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600 shrink-0" /> Trade Brain demand insights</li>
                </ul>
              </div>
              <Button asChild className="w-full bg-[#0F172A] hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 text-white rounded-xl h-11 font-semibold">
                <Link href="/auth/signup">Register as Wholesaler</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}
