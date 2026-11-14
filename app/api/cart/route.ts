import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: cartItems, error } = await admin
    .from('cart_items')
    .select(`
      id,
      quantity,
      product:products (
        id,
        name,
        category,
        base_price,
        unit,
        min_order_quantity,
        image_url,
        seller_id,
        supplier_count,
        is_active,
        seller:profiles!seller_id (
          id,
          business_name,
          name,
          location,
          gst_verified,
          trust_score
        )
      )
    `)
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(cartItems || []);
}

export async function POST(request: Request) {
  const session = await getAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { product_id, quantity } = body;
  const qty = Number(quantity);

  if (!product_id || isNaN(qty) || qty <= 0) {
    return NextResponse.json({ error: 'Valid product_id and positive quantity are required' }, { status: 400 });
  }

  const admin = createServiceClient();
  const { data: product, error: prodError } = await admin
    .from('products')
    .select('id, seller_id, min_order_quantity, is_active')
    .eq('id', product_id)
    .maybeSingle();

  if (prodError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (!product.is_active) {
    return NextResponse.json({ error: 'This product is currently unavailable' }, { status: 400 });
  }
  if (product.seller_id === session.userId) {
    return NextResponse.json({ error: 'You cannot add your own product listing to cart.' }, { status: 400 });
  }

  const moq = Math.max(1, Number(product.min_order_quantity || 1));

  const { data: existingItem } = await admin
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', session.userId)
    .eq('product_id', product_id)
    .maybeSingle();

  if (existingItem) {
    const newQty = existingItem.quantity + Math.floor(qty);
    const { error: updateError } = await admin
      .from('cart_items')
      .update({ quantity: Math.max(moq, newQty) })
      .eq('id', existingItem.id)
      .eq('user_id', session.userId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const initialQty = Math.max(moq, Math.floor(qty));
    const { error: insertError } = await admin
      .from('cart_items')
      .insert({
        user_id: session.userId,
        product_id,
        quantity: initialQty,
      });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const session = await getAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, quantity } = body;
  const qty = Number(quantity);

  if (!id || quantity === undefined || isNaN(qty)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = createServiceClient();

  if (qty <= 0) {
    const { error } = await admin.from('cart_items').delete().eq('id', id).eq('user_id', session.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, deleted: true });
  }

  const { data: existing } = await admin
    .from('cart_items')
    .select('id, product:products(min_order_quantity)')
    .eq('id', id)
    .eq('user_id', session.userId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
  }

  const moq = Math.max(1, Number((existing as any)?.product?.min_order_quantity || 1));
  if (qty < moq) {
    return NextResponse.json(
      { error: `Quantity cannot be below minimum order quantity (${moq}).` },
      { status: 400 }
    );
  }

  const { error } = await admin
    .from('cart_items')
    .update({ quantity: Math.floor(qty) })
    .eq('id', id)
    .eq('user_id', session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error } = await admin
    .from('cart_items')
    .delete()
    .eq('id', id)
    .eq('user_id', session.userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
