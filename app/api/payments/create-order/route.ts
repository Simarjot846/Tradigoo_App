import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { z } from 'zod';

const createOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  sellerId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
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
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { productId, quantity, sellerId } = validation.data;

    // Fetch product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate minimum order quantity
    if (quantity < product.min_order_quantity) {
      return NextResponse.json(
        { error: `Minimum order quantity is ${product.min_order_quantity}` },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = product.base_price * quantity;
    const amountInPaise = Math.round(totalAmount * 100); // Convert to paise

    // Create order in database first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        product_id: productId,
        quantity,
        unit_price: product.base_price,
        total_amount: totalAmount,
        status: 'payment_pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.id,
      notes: {
        order_id: order.id,
        buyer_id: user.id,
        seller_id: sellerId,
        product_id: productId,
      },
    });

    // Update order with Razorpay order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Order update error:', updateError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
