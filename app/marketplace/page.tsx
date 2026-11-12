'use client';

import { Suspense } from 'react';
import MarketplaceContent from '@/components/marketplace/marketplace-content';

export default function MarketplacePage() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceContent initialProducts={[]} />
    </Suspense>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex justify-center py-20 px-4">
      <div className="container mx-auto space-y-8">
        <div className="flex gap-8">
          <div className="hidden md:block w-64 space-y-8">
            <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="p-2 sm:p-3 rounded-xl border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] space-y-2">
                <div className="aspect-square w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3.5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="flex gap-1.5 pt-1">
                  <div className="h-7 flex-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  <div className="h-7 w-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
