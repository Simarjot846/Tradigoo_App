import { createClient, createServiceClient } from '@/lib/supabase-server';
import { calculateItemPricing } from '@/lib/tax';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceClient();

  // Prevent rapid duplicate checkout clicks within 8 seconds
  const eightSecondsAgo = new Date(Date.now() - 8000).toISOString();
  const { data: recentOrders } = await admin
    .from('orders')
    .select('id')
    .eq('buyer_id', user.id)
    .gte('created_at', eightSecondsAgo)
    .limit(1);

  if (recentOrders && recentOrders.length > 0) {
    return NextResponse.json(
      { error: 'Your order is already being processed. Please check My Orders.' },
      { status: 409 }
    );
  }

  const { data: cartItems, error: cartError } = await admin
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products (
        id,
        name,
        category,
        base_price,
        min_order_quantity,
        is_active,
        seller_id
      )
    `)
    .eq('user_id', user.id)
    .returns<any[]>();

  if (cartError || !cartItems || cartItems.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  // Validate items before creating orders
  for (const item of cartItems) {
    if (!item.product || !item.product.is_active) {
      return NextResponse.json(
        { error: `${item.product?.name || 'One of your items'} is no longer active.` },
        { status: 400 }
      );
    }
    const moq = Math.max(1, Number(item.product.min_order_quantity || 1));
    if (Number(item.quantity) < moq) {
      return NextResponse.json(
        { error: `${item.product.name} requires a minimum order quantity of ${moq}.` },
        { status: 400 }
      );
    }
  }

  const createdOrderIds: string[] = [];

  for (const item of cartItems) {
    const pricing = calculateItemPricing(
      Number(item.product.base_price),
      Number(item.quantity),
      item.product.category
    );
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: item.product.seller_id,
        product_id: item.product.id,
        quantity: Number(item.quantity),
        unit_price: Number(item.product.base_price),
        total_amount: pricing.totalAmount,
        status: 'payment_in_escrow',
        otp,
        otp_verified: false,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Checkout order creation error for item', item.id, orderError);
      continue;
    }

    if (order?.id) {
      createdOrderIds.push(order.id);
    }
  }

  if (createdOrderIds.length > 0) {
    await admin.from('cart_items').delete().eq('user_id', user.id);
    return NextResponse.json({ success: true, orderIds: createdOrderIds });
  }

  return NextResponse.json({ error: 'Failed to create orders. Please try again.' }, { status: 500 });
}
