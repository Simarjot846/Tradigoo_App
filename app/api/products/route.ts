import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);
    const category = searchParams.get('category')?.trim();
    const search = searchParams.get('search')?.trim().toLowerCase();
    const sort = searchParams.get('sort') || 'relevance';
    const minPrice = Number(searchParams.get('minPrice') || '0');
    const maxPrice = Number(searchParams.get('maxPrice') || '0');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const sellerId = searchParams.get('sellerId')?.trim();
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const supabase = createServiceClient();
    let query = supabase
      .from('products')
      .select(`
        id,
        seller_id,
        name,
        category,
        base_price,
        unit,
        min_order_quantity,
        image_url,
        description,
        demand_level,
        demand_score,
        expected_margin,
        supplier_count,
        is_active,
        batch_number,
        expiry_date,
        created_at,
        updated_at,
        seller:profiles!seller_id (
          id,
          name,
          business_name,
          location,
          trust_score,
          gst_verified,
          is_low_trust,
          years_in_business
        )
      `);

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (sellerId) {
      query = query.eq('seller_id', sellerId);
    }

    if (category && category.toLowerCase() !== 'all') {
      query = query.ilike('category', category);
    }

    if (!isNaN(minPrice) && minPrice > 0) {
      query = query.gte('base_price', minPrice);
    }
    if (!isNaN(maxPrice) && maxPrice > 0) {
      query = query.lte('base_price', maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;

    let items = (data || []) as any[];

    if (verifiedOnly) {
      items = items.filter((p) => Boolean(p.seller?.gst_verified));
    }

    if (search) {
      const terms = search.split(/\s+/).filter(Boolean);
      items = items.filter((p) => {
        const haystack = [
          p.name,
          p.category,
          p.description,
          p.seller?.business_name,
          p.seller?.name,
          p.seller?.location,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return terms.every((term) => haystack.includes(term));
      });
    }

    switch (sort) {
      case 'price-low':
        items.sort((a, b) => Number(a.base_price) - Number(b.base_price));
        break;
      case 'price-high':
        items.sort((a, b) => Number(b.base_price) - Number(a.base_price));
        break;
      case 'newest':
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'moq-low':
        items.sort((a, b) => Number(a.min_order_quantity) - Number(b.min_order_quantity));
        break;
      case 'trust':
        items.sort((a, b) => Number(b.seller?.trust_score || 0) - Number(a.seller?.trust_score || 0));
        break;
      case 'relevance':
      default:
        items.sort((a, b) => Number(b.demand_score || 0) - Number(a.demand_score || 0));
        break;
    }

    return NextResponse.json(items.slice(offset, offset + limit));
  } catch (error: any) {
    console.error('Products API GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (session.role !== 'wholesaler' && session.role !== 'founder') {
      return NextResponse.json(
        { error: 'Forbidden. Only wholesaler or founder accounts can list products.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      category,
      base_price,
      basePrice,
      unit = 'kg',
      min_order_quantity,
      minOrderQuantity,
      description = '',
      image_url,
      imageUrl,
      batch_number,
      expiry_date,
      is_active,
      seller_id,
    } = body;

    const price = Number(base_price ?? basePrice);
    const moq = Number(min_order_quantity ?? minOrderQuantity ?? 1);

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json({ error: 'Product category is required.' }, { status: 400 });
    }
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Base price must be greater than ₹0.' }, { status: 400 });
    }
    if (isNaN(moq) || moq < 1) {
      return NextResponse.json({ error: 'Minimum order quantity must be at least 1.' }, { status: 400 });
    }

    const targetSellerId =
      session.role === 'founder' && seller_id && typeof seller_id === 'string'
        ? seller_id
        : session.userId;

    const supabaseAdmin = createServiceClient();

    const newProduct = {
      name: name.trim(),
      category: category.trim(),
      base_price: Math.round(price * 100) / 100,
      unit: (unit || 'kg').toString().trim() || 'kg',
      min_order_quantity: Math.floor(moq),
      description: (description || '').toString().trim(),
      image_url: image_url || imageUrl || null,
      seller_id: targetSellerId,
      batch_number: batch_number ? String(batch_number).trim() : null,
      expiry_date: expiry_date ? String(expiry_date).trim() : null,
      demand_level: 'Standard',
      demand_score: 75,
      expected_margin: 15,
      supplier_count: 1,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([newProduct])
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
      console.error('Database insert product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Products API POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
