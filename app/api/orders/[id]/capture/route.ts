import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { capturePayment } from '@/lib/razorpay';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('buyer_id', session.userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'inspection') {
      return NextResponse.json({ error: 'Order is not in inspection status' }, { status: 400 });
    }

    if (!order.razorpay_payment_id) {
      return NextResponse.json({ error: 'Payment ID not found' }, { status: 400 });
    }

    const amountInPaise = Math.round(order.total_amount * 100);
    await capturePayment(order.razorpay_payment_id, amountInPaise);

    const { error: updateError } = await admin
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', id);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment captured successfully',
    });

  } catch (error) {
    console.error('Capture payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
