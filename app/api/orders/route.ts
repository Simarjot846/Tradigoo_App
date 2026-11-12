import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get('role');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 100);

    const supabase = createServiceClient();
    let query = supabase
      .from('orders')
      .select(`
        *,
        product:products!product_id (
          id,
          name,
          category,
          image_url,
          unit
        ),
        seller:profiles!seller_id (
          id,
          business_name,
          name,
          location,
          gst_verified,
          trust_score
        ),
        buyer:profiles!buyer_id (
          id,
          business_name,
          name,
          location
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Non-privileged users can only access their own orders
    if (session.role === 'wholesaler') {
      query = query.eq('seller_id', session.userId);
    } else if (session.role === 'retailer') {
      query = query.eq('buyer_id', session.userId);
    } else if (session.role === 'founder' || session.role === 'employee') {
      const filterUserId = searchParams.get('userId');
      if (filterUserId) {
        if (requestedRole === 'wholesaler') {
          query = query.eq('seller_id', filterUserId);
        } else if (requestedRole === 'buyer' || requestedRole === 'retailer') {
          query = query.eq('buyer_id', filterUserId);
        }
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
