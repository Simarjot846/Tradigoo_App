import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase-server';
import { mockProducts } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const adminSupabase = createServiceClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch Profile to check Role (using admin client to be safe, though User can read own profile)
        const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', user.id).single();
        if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

        const isRetailer = profile.role === 'retailer';
        const userId = user.id;

        // --- MOCK DATA GENERATION ---

        // 1. Ensure Products Exist (if not, generic ones)
        // We assume some products exist, or we insert mocked ones linked to a "System Wholesaler"
        // For simplicity, we'll CREATE a mock product row if needed or just use random UUIDs if allowed (but FK constraints might fail).
        // Best logic: Create 1 Mock Seller and 3 Mock Products first.

        // Create Mock Seller (Soft check)
        // Actually, let's just create products owned by THIS user if they are a wholesaler, 
        // or by a "Demo Wholesaler" if they are a Retailer.

        let sellerId = isRetailer ? '00000000-0000-0000-0000-000000000000' : userId;
        // note: UUID 00... might fail FK if not exists. 
        // Let's assume we just use the current user as seller for "wholesaler mode"
        // And for "retailer mode", we NEED a seller.

        // Hackathon Shortcut: If Retailer, make THEM the seller too for the product FKs, 
        // OR create a dummy profile.
        // Let's create a dummy profile row if it doesn't exist? Too complex.
        // Let's just Insert Products with the Current User ID as seller (even if they are retailer, DB doesn't care about role string usually).
        // This ensures FK validity.

        // Create products using the rich mock data from lib
        // 1. Clear existing demo data for this user to ensure fresh images
        const { error: deleteError } = await adminSupabase
            .from('products')
            .delete()
            .eq('seller_id', userId);

        if (deleteError) console.error("Error clearing old products:", deleteError);

        // Create products using the rich mock data from lib
        const productData = mockProducts.map(p => ({
            seller_id: userId,
            name: p.name,
            category: p.category,
            base_price: p.base_price,
            demand_level: p.demand_level,
            description: p.description,
            unit: p.unit,
            min_order_quantity: p.min_order_quantity,
            is_active: true,
            image_url: p.image_url
        }));

        const { data: products, error: prodError } = await adminSupabase
            .from('products')
            .insert(productData) // We can use insert now since we cleared
            .select();

        if (prodError) throw prodError;
        const prod1 = products[0];
        const prod2 = products[1];

        // 2. Create Orders in Different States

        const ordersToCreate = [];

        // Scenarios for Retailer Dashboard Demo:

        // A. "Active Order" (SHIPPED) -> Needs OTP soon
        ordersToCreate.push({
            buyer_id: userId,
            seller_id: userId, // Verify self-orders logic? usually fine for demo.
            product_id: prod1.id,
            quantity: 20,
            unit_price: prod1.base_price,
            total_amount: 20 * prod1.base_price,
            status: 'shipped',
            otp: '123456', // Hardcoded for demo ease!
        });

        // B. "Action Needed" (INSPECTION_PENDING) -> Can raise dispute
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 0.5); // 12 hours ago
        ordersToCreate.push({
            buyer_id: userId,
            seller_id: userId,
            product_id: prod2.id,
            quantity: 50,
            unit_price: prod2.base_price,
            total_amount: 50 * prod2.base_price,
            status: 'inspection',
            inspection_deadline: new Date(Date.now() + 43200000).toISOString(), // +12 hours left
            otp_verified: true
        });

        // C. "History" (PAYMENT_RELEASED)
        ordersToCreate.push({
            buyer_id: userId,
            seller_id: userId,
            product_id: prod1.id,
            quantity: 100,
            unit_price: prod1.base_price - 100, // discount
            total_amount: 100 * (prod1.base_price - 100),
            status: 'completed',
            otp_verified: true
        });

        // Insert
        const { error: orderError } = await adminSupabase.from('orders').insert(ordersToCreate);
        if (orderError) throw orderError;

        return NextResponse.json({
            success: true,
            message: 'Demo Environment Seeded! Refresh Dashboard.',
            details: 'Created 2 Products, 3 Orders (Shipped, Inspection, Released)'
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
