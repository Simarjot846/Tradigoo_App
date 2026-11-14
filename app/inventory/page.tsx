'use client';

import { Suspense } from 'react';
import InventoryContent from '@/components/inventory/inventory-content';
import { AuthGuard } from '@/components/auth/auth-guard';

export default function InventoryPage() {
  return (
    <AuthGuard allowedRoles={['wholesaler', 'founder']}>
      <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-zinc-950" />}>
        <InventoryContent initialProducts={[]} />
      </Suspense>
    </AuthGuard>
  );
}
