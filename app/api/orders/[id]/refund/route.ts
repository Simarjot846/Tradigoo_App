import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
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
    
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = refundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { reason, amount } = validation.data;

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order can be refunded
    if (!['payment_in_escrow', 'inspection', 'disputed'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be refunded in current status' },
        { status: 400 }
      );
    }

    // Verify payment ID exists
    if (!order.razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Payment ID not found' },
        { status: 400 }
      );
    }

    // Process refund
    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    await refundPayment(order.razorpay_payment_id, refundAmount);

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'refunded',
        dispute_reason: reason,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
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
