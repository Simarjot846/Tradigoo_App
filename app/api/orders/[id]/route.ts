import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const admin = createServiceClient();

    const { data: order, error } = await admin
      .from('orders')
      .select(`
        *,
        product:products!product_id (
          id,
          name,
          category,
          image_url,
          unit,
          base_price
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
      .eq('id', id)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isParticipant =
      order.buyer_id === session.userId ||
      order.seller_id === session.userId ||
      session.role === 'founder' ||
      session.role === 'employee';

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error('[GET /api/orders/[id]] Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load order' }, { status: 500 });
  }
}
