import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, reason, evidenceUrls } = await request.json();

    if (!orderId || !reason || !String(reason).trim()) {
      return NextResponse.json({ error: 'Order ID and dispute reason are required.' }, { status: 400 });
    }

    const admin = createServiceClient();
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.buyer_id !== session.userId && order.seller_id !== session.userId && session.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const normalizedStatus = String(order.status || '').trim().toLowerCase();
    const allowedStates = ['payment_in_escrow', 'shipped', 'courier_verified', 'delivered', 'inspection', 'inspection_pending'];
    if (!allowedStates.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Disputes cannot be raised when order is ${order.status}.` },
        { status: 400 }
      );
    }

    const cleanReason = String(reason).trim();
    const evidenceList = Array.isArray(evidenceUrls) ? evidenceUrls.filter((u) => typeof u === 'string' && u.trim()) : [];

    const { error: disputeError } = await admin.from('disputes').insert({
      order_id: orderId,
      raised_by: session.userId,
      reason: cleanReason,
      evidence_urls: evidenceList,
      status: 'pending',
      resolution_notes: 'Submitted for operations team review.',
    });

    if (disputeError) throw disputeError;

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'disputed',
        dispute_reason: cleanReason,
        dispute_evidence: evidenceList,
        resolution_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      status: 'disputed',
      message: 'Dispute submitted for operations review.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to raise dispute' }, { status: 500 });
  }
}
