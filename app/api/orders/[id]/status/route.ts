import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { validateTransition } from '@/lib/order-state-machine';
import { OrderStatus } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status: newStatus } = await request.json();
    if (!newStatus || typeof newStatus !== 'string') {
      return NextResponse.json({ error: 'Target status is required.' }, { status: 400 });
    }

    const admin = createServiceClient();
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isBuyer = order.buyer_id === session.userId;
    const isSeller = order.seller_id === session.userId;
    const isOpsOrFounder = session.role === 'employee' || session.role === 'founder';

    if (!isBuyer && !isSeller && !isOpsOrFounder) {
      return NextResponse.json({ error: 'Forbidden. You cannot modify this order.' }, { status: 403 });
    }

    const normalizedTarget = newStatus.trim().toLowerCase();

    // Role-specific action permissions
    if (!isOpsOrFounder) {
      if ((normalizedTarget === 'shipped' || normalizedTarget === 'courier_verified') && !isSeller) {
        return NextResponse.json({ error: 'Only the seller can mark an order as shipped.' }, { status: 403 });
      }
      if ((normalizedTarget === 'completed' || normalizedTarget === 'payment_released') && !isBuyer) {
        return NextResponse.json({ error: 'Only the buyer can release escrow payment.' }, { status: 403 });
      }
      if ((normalizedTarget === 'refunded') && !isOpsOrFounder) {
        return NextResponse.json({ error: 'Only operations staff or founder can issue a refund.' }, { status: 403 });
      }
    }

    if (!validateTransition(order.status as OrderStatus, newStatus as OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${order.status} to ${newStatus}` },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (normalizedTarget === 'shipped' && !order.shipped_at) {
      updates.shipped_at = new Date().toISOString();
    }
    if (normalizedTarget === 'delivered' && !order.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }
    if (normalizedTarget === 'inspection' || normalizedTarget === 'inspection_pending') {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
      updates.inspection_deadline = deadline.toISOString();
    }

    const { data: updated, error: updateError } = await admin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, status: newStatus, order: updated });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status' }, { status: 500 });
  }
}
