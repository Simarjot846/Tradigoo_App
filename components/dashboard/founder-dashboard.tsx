'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/auth-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductImage } from '@/components/ui/product-image';
import { toast } from 'sonner';
import {
  IndianRupee,
  Package,
  Users,
  ShieldCheck,
  AlertTriangle,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  BarChart3,
  Scale,
  Building2,
} from 'lucide-react';

type FounderTab = 'overview' | 'users' | 'products' | 'orders';

export function FounderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FounderTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [directory, setDirectory] = useState<{
    users: any[];
    products: any[];
    orders: any[];
    disputes: any[];
  }>({ users: [], products: [], orders: [], disputes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadFounderData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes] = await Promise.all([
        authFetch('/api/admin/founder-stats', { cache: 'no-store' }),
        authFetch('/api/admin/users', { cache: 'no-store' }),
      ]);

      if (!statsRes.ok) {
        const errPayload = await statsRes.json().catch(() => ({}));
        throw new Error(errPayload.error || 'Failed to load founder analytics');
      }
      if (!usersRes.ok) {
        const errPayload = await usersRes.json().catch(() => ({}));
        throw new Error(errPayload.error || 'Failed to load directory');
      }

      const [statsJson, usersJson] = await Promise.all([statsRes.json(), usersRes.json()]);
      setStats(statsJson);
      setDirectory({
        users: Array.isArray(usersJson.users) ? usersJson.users : [],
        products: Array.isArray(usersJson.products) ? usersJson.products : [],
        orders: Array.isArray(usersJson.orders) ? usersJson.orders : [],
        disputes: Array.isArray(usersJson.disputes) ? usersJson.disputes : [],
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to fetch founder console metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFounderData();
  }, [loadFounderData]);

  const handleToggleUserFlag = async (
    targetUser: any,
    field: 'gst_verified' | 'is_low_trust',
    nextValue: boolean
  ) => {
    setBusyId(`${targetUser.id}:${field}`);
    try {
      const res = await authFetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUser.id,
          [field]: nextValue,
        }),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Update failed');

      setDirectory((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === targetUser.id ? { ...u, ...updated } : u)),
      }));

      toast.success(
        field === 'gst_verified'
          ? `${targetUser.business_name || targetUser.name} GST ${nextValue ? 'verified' : 'unverified'}.`
          : `${targetUser.business_name || targetUser.name} trust flag updated.`
      );
      loadFounderData();
    } catch (err: any) {
      toast.error(err?.message || 'Could not update user status');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleProductActive = async (product: any) => {
    setBusyId(`prod:${product.id}`);
    try {
      const nextActive = !product.is_active;
      const res = await authFetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to update product');

      setDirectory((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === product.id ? { ...p, is_active: nextActive } : p
        ),
      }));
      toast.success(
        `${product.name} is now ${nextActive ? 'active in marketplace' : 'hidden from buyers'}.`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle listing');
    } finally {
      setBusyId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return directory.users.filter((u) => {
      const roleMatch =
        userRoleFilter === 'all' || (u.effectiveRole || u.role) === userRoleFilter;
      if (!roleMatch) return false;
      if (!q) return true;
      return (
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.business_name || '').toLowerCase().includes(q) ||
        (u.gst_number || '').toLowerCase().includes(q) ||
        (u.location || '').toLowerCase().includes(q)
      );
    });
  }, [directory.users, userSearch, userRoleFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return directory.products;
    return directory.products.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.seller?.business_name || '').toLowerCase().includes(q)
    );
  }, [directory.products, productSearch]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return directory.orders;
    return directory.orders.filter(
      (o) =>
        (o.id || '').toLowerCase().includes(q) ||
        (o.product?.name || '').toLowerCase().includes(q) ||
        (o.buyer?.business_name || o.buyer?.name || '').toLowerCase().includes(q) ||
        (o.seller?.business_name || o.seller?.name || '').toLowerCase().includes(q) ||
        (o.status || '').toLowerCase().includes(q)
    );
  }, [directory.orders, orderSearch]);

  const maxCategoryCount = useMemo(() => {
    if (!stats?.categoryBreakdown?.length) return 1;
    return Math.max(...stats.categoryBreakdown.map((c: any) => c.products || 1), 1);
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 sm:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 w-72 rounded-xl bg-slate-200 dark:bg-zinc-800 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-pulse"
              />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Founder Console Unavailable
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">{error}</p>
          <Button onClick={loadFounderData} className="bg-blue-600 hover:bg-blue-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top Command Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Founder Command Console
              </span>
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">{user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Marketplace Operations &amp; Oversight
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Real-time platform volume, GST compliance verification, catalog moderation, and dispute review.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={loadFounderData}
              disabled={loading}
              className="h-9 text-xs font-semibold whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Live Data
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Gross Trade Volume
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              ₹{Number(stats?.platformTransactionVolume || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
              {stats?.completedOrders || 0} completed · {stats?.pendingOrders || 0} active escrow
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Verified Partners
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {(stats?.totalRetailers || 0) + (stats?.totalWholesalers || 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
              {stats?.totalWholesalers || 0} wholesalers ({stats?.verifiedWholesalers || 0} GST verified) · {stats?.totalRetailers || 0} retailers
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Catalog Listings
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats?.totalActiveProducts || 0}
              <span className="text-sm font-normal text-slate-400 dark:text-zinc-500">
                {' '}
                / {stats?.totalProducts || 0}
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
              {stats?.pendingSupplierVerification || 0} suppliers awaiting GST verification
            </p>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Disputes &amp; Risk
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats?.pendingDisputes || 0}
              <span className="text-sm font-normal text-slate-400 dark:text-zinc-500">
                {' '}
                open / {stats?.totalDisputes || 0} total
              </span>
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
              {stats?.lowTrustAccounts || 0} low-trust flagged accounts
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
          {[
            { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
            { id: 'users', label: `Users & GST (${directory.users.length})`, icon: ShieldCheck },
            { id: 'products', label: `Catalog (${directory.products.length})`, icon: Package },
            { id: 'orders', label: `Orders & Disputes (${directory.orders.length})`, icon: Scale },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FounderTab)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown */}
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Catalog by Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Live distribution of registered B2B SKUs
                </p>
              </div>
              {stats?.categoryBreakdown?.length ? (
                <div className="space-y-3">
                  {stats.categoryBreakdown.slice(0, 8).map((cat: any) => {
                    const widthPct = Math.max(8, Math.round((cat.products / maxCategoryCount) * 100));
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-zinc-200 truncate">
                            {cat.category}
                          </span>
                          <span className="font-mono text-slate-500 dark:text-zinc-400 tabular-nums">
                            {cat.products} SKUs
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-8 text-center">No catalog categories yet.</p>
              )}
            </div>

            {/* Recent Escrow Orders */}
            <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Recent Escrow Transactions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Latest live wholesale orders across the marketplace
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-blue-600 dark:text-blue-400"
                >
                  View All
                </Button>
              </div>

              {stats?.recentOrders?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                        <th className="py-2.5 pr-3 font-semibold">Order</th>
                        <th className="py-2.5 pr-3 font-semibold">Product</th>
                        <th className="py-2.5 pr-3 font-semibold">Buyer → Supplier</th>
                        <th className="py-2.5 pr-3 font-semibold">Amount</th>
                        <th className="py-2.5 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {stats.recentOrders.slice(0, 8).map((order: any) => (
                        <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-3 pr-3 font-mono text-slate-700 dark:text-zinc-300">
                            <Link href={`/order/${order.id}`} className="hover:underline text-blue-600 dark:text-blue-400">
                              #{order.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="py-3 pr-3 font-medium text-slate-900 dark:text-white max-w-[160px] truncate">
                            {order.product?.name || 'Wholesale Order'}
                          </td>
                          <td className="py-3 pr-3 text-slate-600 dark:text-zinc-400 max-w-[200px] truncate">
                            {(order.buyer?.business_name || order.buyer?.name || 'Retailer')} →{' '}
                            {(order.seller?.business_name || order.seller?.name || 'Supplier')}
                          </td>
                          <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white tabular-nums">
                            ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-medium capitalize">
                              {String(order.status || '').replace(/_/g, ' ').toLowerCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">No orders recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* USERS & GST VERIFICATION TAB */}
        {activeTab === 'users' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search business name, email, GSTIN, city..."
                  className="pl-9 h-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'wholesaler', 'retailer', 'employee'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap ${
                      userRoleFilter === r
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 pr-3 font-semibold">Partner</th>
                    <th className="py-2.5 pr-3 font-semibold">Role</th>
                    <th className="py-2.5 pr-3 font-semibold">GSTIN</th>
                    <th className="py-2.5 pr-3 font-semibold">Trust</th>
                    <th className="py-2.5 font-semibold text-right">Governance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredUsers.map((u) => {
                    const role = u.effectiveRole || u.role;
                    const gstBusy = busyId === `${u.id}:gst_verified`;
                    const trustBusy = busyId === `${u.id}:is_low_trust`;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.business_name || u.name || 'Unnamed Account'}</span>
                          </div>
                          <div className="text-slate-500 dark:text-zinc-400 mt-0.5">
                            {u.email} {u.location ? `· ${u.location}` : ''}
                          </div>
                        </td>
                        <td className="py-3 pr-3 capitalize font-medium text-slate-700 dark:text-zinc-300">
                          {role}
                        </td>
                        <td className="py-3 pr-3 font-mono text-slate-700 dark:text-zinc-300">
                          {u.gst_number || <span className="text-slate-400">Not submitted</span>}
                        </td>
                        <td className="py-3 pr-3 tabular-nums">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {u.trust_score ?? 500}
                          </span>
                          <span className="text-slate-400"> / 1000</span>
                          {u.is_low_trust && (
                            <span className="ml-2 text-rose-600 dark:text-rose-400 font-semibold">
                              (Low Trust)
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={u.gst_verified ? 'outline' : 'default'}
                              disabled={gstBusy}
                              onClick={() =>
                                handleToggleUserFlag(u, 'gst_verified', !u.gst_verified)
                              }
                              className={`h-7 px-2.5 text-[11px] font-semibold whitespace-nowrap ${
                                u.gst_verified
                                  ? 'border-emerald-300 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {u.gst_verified ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> GST Verified
                                </>
                              ) : (
                                'Verify GST'
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={trustBusy}
                              onClick={() =>
                                handleToggleUserFlag(u, 'is_low_trust', !u.is_low_trust)
                              }
                              className={`h-7 px-2.5 text-[11px] font-semibold whitespace-nowrap ${
                                u.is_low_trust
                                  ? 'border-rose-300 text-rose-600 dark:text-rose-400'
                                  : 'text-slate-600 dark:text-zinc-300'
                              }`}
                            >
                              {u.is_low_trust ? (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" /> Clear Flag
                                </>
                              ) : (
                                'Flag Risk'
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No accounts match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS OVERSIGHT TAB */}
        {activeTab === 'products' && (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search catalog by product, category, or supplier..."
                className="pl-9 h-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 pr-3 font-semibold">Product</th>
                    <th className="py-2.5 pr-3 font-semibold">Supplier</th>
                    <th className="py-2.5 pr-3 font-semibold">Price / MOQ</th>
                    <th className="py-2.5 pr-3 font-semibold">Visibility</th>
                    <th className="py-2.5 font-semibold text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={p.image_url}
                            alt={p.name}
                            category={p.category}
                            aspect="square"
                            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/product/${p.id}`}
                              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 truncate block max-w-[200px]"
                            >
                              {p.name}
                            </Link>
                            <span className="text-slate-500 dark:text-zinc-400">{p.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-700 dark:text-zinc-300">
                        {p.seller?.business_name || p.seller?.name || 'Supplier'}
                      </td>
                      <td className="py-3 pr-3 tabular-nums">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ₹{Number(p.base_price || 0).toLocaleString('en-IN')}
                        </span>{' '}
                        <span className="text-slate-500">
                          / {p.unit} (MOQ {p.min_order_quantity})
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                            p.is_active
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === `prod:${p.id}`}
                          onClick={() => handleToggleProductActive(p)}
                          className="h-7 px-2.5 text-[11px] font-semibold"
                        >
                          {p.is_active ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" /> Hide Listing
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" /> Activate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No products match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS & DISPUTES TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  All Escrow Orders
                </h2>
                <div className="relative max-w-sm w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Filter by order ID, buyer, seller, status..."
                    className="pl-9 h-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                      <th className="py-2.5 pr-3 font-semibold">Order ID</th>
                      <th className="py-2.5 pr-3 font-semibold">Product</th>
                      <th className="py-2.5 pr-3 font-semibold">Buyer</th>
                      <th className="py-2.5 pr-3 font-semibold">Supplier</th>
                      <th className="py-2.5 pr-3 font-semibold">Total</th>
                      <th className="py-2.5 pr-3 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 pr-3 font-mono">#{o.id.slice(0, 8)}</td>
                        <td className="py-3 pr-3 font-medium text-slate-900 dark:text-white">
                          {o.product?.name || 'Item'} ({o.quantity})
                        </td>
                        <td className="py-3 pr-3 text-slate-600 dark:text-zinc-400">
                          {o.buyer?.business_name || o.buyer?.name || 'Retailer'}
                        </td>
                        <td className="py-3 pr-3 text-slate-600 dark:text-zinc-400">
                          {o.seller?.business_name || o.seller?.name || 'Supplier'}
                        </td>
                        <td className="py-3 pr-3 font-semibold tabular-nums">
                          ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 pr-3 capitalize">
                          {String(o.status || '').replace(/_/g, ' ').toLowerCase()}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/order/${o.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                          >
                            Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {directory.disputes.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 space-y-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Dispute Queue ({directory.disputes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {directory.disputes.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-slate-200 dark:border-zinc-800 p-4 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-zinc-950"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-slate-500">
                          Order #{String(d.order_id || '').slice(0, 8)} · {d.status}
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 line-clamp-2">
                          {d.reason}
                        </p>
                      </div>
                      <Link
                        href={`/dispute/${d.order_id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
