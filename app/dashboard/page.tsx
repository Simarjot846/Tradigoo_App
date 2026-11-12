'use client';

import { useAuth } from '@/lib/auth-context';
import { BuyerDashboard } from '@/components/dashboard/buyer-dashboard';
import { SellerDashboard } from '@/components/dashboard/seller-dashboard';
import { FounderDashboard } from '@/components/dashboard/founder-dashboard';
import { EmployeeDashboard } from '@/components/dashboard/employee-dashboard';
import { AuthGuard } from '@/components/auth/auth-guard';

function DashboardContent() {
  const { user } = useAuth();

  if (user?.role === 'founder') {
    return <FounderDashboard />;
  }

  if (user?.role === 'employee') {
    return <EmployeeDashboard />;
  }

  if (user?.role === 'wholesaler') {
    return <SellerDashboard />;
  }

  return <BuyerDashboard />;
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
