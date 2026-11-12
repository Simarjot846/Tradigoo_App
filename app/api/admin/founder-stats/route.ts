import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden. Founder privileges required.' }, { status: 403 });
    }

    const supabase = createServiceClient();

    const [profilesRes, productsRes, ordersRes, disputesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, email, role, business_name, location, trust_score, gst_number, gst_verified, is_low_trust, total_orders, successful_orders, disputed_orders, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('products')
        .select('id, name, category, base_price, is_active, seller_id, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          quantity,
          buyer:profiles!buyer_id(business_name, name, email),
          seller:profiles!seller_id(business_name, name, email),
          product:products!product_id(name, category)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('disputes')
        .select('id, order_id, raised_by, reason, status, created_at')
        .order('created_at', { ascending: false }),
    ]);

    const profiles = profilesRes.data || [];
    const products = productsRes.data || [];
    const orders = ordersRes.data || [];
    const disputes = disputesRes.data || [];

    const totalRetailers = profiles.filter((p) => p.role === 'retailer').length;
    const totalWholesalers = profiles.filter((p) => p.role === 'wholesaler').length;
    const verifiedWholesalers = profiles.filter((p) => p.role === 'wholesaler' && p.gst_verified).length;
    const pendingVerification = profiles.filter((p) => p.role === 'wholesaler' && !p.gst_verified).length;
    const lowTrustAccounts = profiles.filter((p) => p.is_low_trust || Number(p.trust_score || 0) < 350).length;

    const totalActiveProducts = products.filter((p) => p.is_active).length;
    const totalOrders = orders.length;

    const pendingOrders = orders.filter((o) =>
      ['payment_pending', 'payment_in_escrow', 'shipped', 'courier_verified', 'inspection', 'ORDER_CREATED', 'PAYMENT_HELD', 'SHIPPED', 'INSPECTION_PENDING'].includes(o.status)
    ).length;

    const completedOrders = orders.filter((o) =>
      ['completed', 'COMPLETED', 'DELIVERED', 'delivered', 'PAYMENT_RELEASED'].includes(o.status)
    ).length;

    const cancelledOrders = orders.filter((o) =>
      ['cancelled', 'CANCELLED', 'refunded', 'REFUNDED'].includes(o.status)
    ).length;

    const pendingDisputes = disputes.filter((d) => ['pending', 'under_review'].includes(d.status)).length;

    const totalGmv = orders.reduce((sum, o) => {
      if (['cancelled', 'CANCELLED', 'refunded', 'REFUNDED'].includes(o.status)) return sum;
      const amt = Number(o.total_amount || 0);
      return isNaN(amt) ? sum : sum + amt;
    }, 0);

    // Category breakdown for founder charts
    const categoryTotals: Record<string, { category: string; products: number }> = {};
    for (const p of products) {
      const cat = p.category || 'General';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { category: cat, products: 0 };
      }
      categoryTotals[cat].products += 1;
    }

    return NextResponse.json({
      totalRetailers,
      totalWholesalers,
      verifiedWholesalers,
      pendingSupplierVerification: pendingVerification,
      lowTrustAccounts,
      totalActiveProducts,
      totalProducts: products.length,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      pendingDisputes,
      totalDisputes: disputes.length,
      platformTransactionVolume: Math.round(totalGmv * 100) / 100,
      platformHealth: 'OPERATIONAL',
      serverTimestamp: new Date().toISOString(),
      categoryBreakdown: Object.values(categoryTotals).sort((a, b) => b.products - a.products),
      recentOrders: orders.slice(0, 12),
      recentDisputes: disputes.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Founder stats API error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
