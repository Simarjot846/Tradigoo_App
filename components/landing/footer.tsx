'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 py-12 pb-24 sm:pb-16 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <Link href="/" className="inline-flex mb-4">
              <BrandLogo size="md" />
            </Link>
            <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
              Verified B2B wholesale marketplace connecting Indian retailers and suppliers with escrow protection.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-zinc-400">
              <li>
                <Link href="/marketplace" className="hover:text-blue-600 transition-colors">
                  Marketplace Catalog
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-blue-600 transition-colors">
                  Escrow Protection
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">
                  Logistics &amp; OTP
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-blue-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Get Started</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-zinc-400">
              <li>
                <Link href="/auth/signup" className="hover:text-blue-600 transition-colors">
                  Register as Retailer
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-blue-600 transition-colors">
                  Register as Wholesaler
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-blue-600 transition-colors">
                  Partner Sign In
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-zinc-400">
              <li>
                <a href="mailto:contact@tradigoo.com" className="hover:text-blue-600 transition-colors">
                  contact@tradigoo.com
                </a>
              </li>
              <li>GST &amp; Escrow Compliance</li>
              <li>24h Delivery Inspection</li>
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Tradigoo Commerce. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Built for Indian B2B Wholesale Trade
          </p>
        </div>
      </div>
    </footer>
  );
}
