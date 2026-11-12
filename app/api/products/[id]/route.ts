import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = createServiceClient();

    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          name,
          business_name,
          location,
          trust_score,
          gst_verified,
          is_low_trust,
          total_orders,
          successful_orders,
          disputed_orders,
          years_in_business
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = createServiceClient();

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, seller_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existing.seller_id !== session.userId && session.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden. You do not own this product.' }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      const trimmed = String(body.name).trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Product name cannot be empty.' }, { status: 400 });
      }
      updates.name = trimmed;
    }
    if (body.category !== undefined) {
      updates.category = String(body.category).trim();
    }
    if (body.base_price !== undefined || body.basePrice !== undefined) {
      const price = Number(body.base_price ?? body.basePrice);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json({ error: 'Base price must be greater than 0.' }, { status: 400 });
      }
      updates.base_price = Math.round(price * 100) / 100;
    }
    if (body.min_order_quantity !== undefined || body.minOrderQuantity !== undefined) {
      const moq = Number(body.min_order_quantity ?? body.minOrderQuantity);
      if (isNaN(moq) || moq < 1) {
        return NextResponse.json({ error: 'MOQ must be at least 1.' }, { status: 400 });
      }
      updates.min_order_quantity = Math.floor(moq);
    }
    if (body.unit !== undefined) updates.unit = String(body.unit).trim() || 'unit';
    if (body.description !== undefined) updates.description = String(body.description).trim();
    if (body.image_url !== undefined || body.imageUrl !== undefined) {
      updates.image_url = body.image_url ?? body.imageUrl ?? null;
    }
    if (body.batch_number !== undefined) {
      updates.batch_number = body.batch_number ? String(body.batch_number).trim() : null;
    }
    if (body.expiry_date !== undefined) {
      updates.expiry_date = body.expiry_date ? String(body.expiry_date).trim() : null;
    }
    if (body.is_active !== undefined || body.isActive !== undefined) {
      updates.is_active = Boolean(body.is_active ?? body.isActive);
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        seller:profiles!seller_id (
          id,
          name,
          business_name,
          location,
          trust_score,
          gst_verified,
          is_low_trust
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabaseAdmin = createServiceClient();

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, seller_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existing.seller_id !== session.userId && session.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden. You do not own this product.' }, { status: 403 });
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);

    if (error) {
      console.error('Delete product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
