import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { capturePayment } from '@/lib/razorpay';

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

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order is in inspection status
    if (order.status !== 'inspection') {
      return NextResponse.json(
        { error: 'Order is not in inspection status' },
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

    // Capture payment (release from escrow)
    const amountInPaise = Math.round(order.total_amount * 100);
    await capturePayment(order.razorpay_payment_id, amountInPaise);

    // Update order status to completed
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
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
