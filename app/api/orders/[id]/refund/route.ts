import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { refundPayment } from '@/lib/razorpay';
import { z } from 'zod';

const refundSchema = z.object({
  reason: z.string().min(10),
  amount: z.number().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { reason, amount } = validation.data;
    const admin = createServiceClient();

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', id)
      .or(`buyer_id.eq.${session.userId},seller_id.eq.${session.userId}`)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!['payment_in_escrow', 'inspection', 'disputed'].includes(order.status)) {
      return NextResponse.json({ error: 'Order cannot be refunded in current status' }, { status: 400 });
    }

    if (!order.razorpay_payment_id) {
      return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 });
    }

    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    await refundPayment(order.razorpay_payment_id, refundAmount);

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: 'refunded',
        dispute_reason: reason,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Refund initiated successfully',
    });

  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
