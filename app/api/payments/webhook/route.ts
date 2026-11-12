import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { verifyWebhookSignature, capturePayment } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload.payment.entity;



    // Use service role client for admin operations
    const supabase = createServiceClient();

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
        // Payment is authorized but not captured (held in escrow)
        await handlePaymentAuthorized(supabase, paymentEntity);
        break;

      case 'payment.captured':
        // Payment has been captured (released from escrow)
        await handlePaymentCaptured(supabase, paymentEntity);
        break;

      case 'payment.failed':
        // Payment failed
        await handlePaymentFailed(supabase, paymentEntity);
        break;

      case 'refund.created':
        // Refund initiated
        await handleRefundCreated(supabase, payload.payload.refund.entity);
        break;

      default:

    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePaymentAuthorized(supabase: any, payment: any) {
  const orderId = payment.notes?.order_id;

  if (!orderId) {
    console.error('Order ID not found in payment notes');
    return;
  }

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'payment_in_escrow',
      razorpay_payment_id: payment.id,
    })
    .eq('razorpay_order_id', payment.order_id);

  if (error) {
    console.error('Failed to update order:', error);
  }
}

async function handlePaymentCaptured(supabase: any, payment: any) {
  const orderId = payment.notes?.order_id;

  if (!orderId) {
    console.error('Order ID not found in payment notes');
    return;
  }

  // Update order status to completed
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'completed',
    })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order:', error);
  }
}

async function handlePaymentFailed(supabase: any, payment: any) {
  const orderId = payment.notes?.order_id;

  if (!orderId) {
    console.error('Order ID not found in payment notes');
    return;
  }

  // Update order status to cancelled
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
    })
    .eq('razorpay_order_id', payment.order_id);

  if (error) {
    console.error('Failed to update order:', error);
  }
}

async function handleRefundCreated(supabase: any, refund: any) {
  const paymentId = refund.payment_id;

  // Find order by payment ID
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_payment_id', paymentId)
    .single();

  if (!order) {
    console.error('Order not found for refund');
    return;
  }

  // Update order status to refunded
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'refunded',
    })
    .eq('id', order.id);

  if (error) {
    console.error('Failed to update order:', error);
  }
}

// Configure route to handle raw body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
