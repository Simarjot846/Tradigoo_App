import { NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase-server';
import { calculateItemPricing } from '@/lib/tax';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seller_id, product_id, quantity } = body;

    const supabaseAuth = await createClient();
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const buyer_id = authUser.id;
    const supabase = createServiceClient();

    const isProductUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id || '');
    if (!isProductUuid) {
      return NextResponse.json({ error: 'Valid product_id is required.' }, { status: 400 });
    }

    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, name, category, base_price, min_order_quantity, seller_id, is_active')
      .eq('id', product_id)
      .maybeSingle();

    if (prodError || !product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
    if (!product.is_active) {
      return NextResponse.json({ error: 'This product is currently unavailable.' }, { status: 400 });
    }

    const qty = Math.floor(Number(quantity) || 0);
    const moq = Math.max(1, Number(product.min_order_quantity || 1));
    if (qty < moq) {
      return NextResponse.json(
        { error: `Quantity must meet minimum order quantity (${moq}).` },
        { status: 400 }
      );
    }

    const pricing = calculateItemPricing(Number(product.base_price), qty, product.category);
    const resolvedSellerId = product.seller_id || seller_id;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        buyer_id,
        seller_id: resolvedSellerId,
        product_id: product.id,
        quantity: qty,
        unit_price: Number(product.base_price),
        total_amount: pricing.totalAmount,
        status: 'payment_in_escrow',
        otp: generatedOtp,
        otp_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Server-side Order Create Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Order Create API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
