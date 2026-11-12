import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createServiceClient();

    // 1. Fetch genuine profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, business_name, role, gst_verified, trust_score, total_orders, successful_orders, disputed_orders')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 2. Fetch genuine orders for this supplier
    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, total_amount')
      .eq('seller_id', userId);

    const supplierOrders = orders || [];
    const totalOrders = supplierOrders.length;

    // Check if sufficient transaction history exists
    if (totalOrders === 0) {
      return NextResponse.json({
        userId,
        hasEnoughData: false,
        score: null,
        totalOrders: 0,
        completedOrders: 0,
        disputedOrders: 0,
        gstVerified: !!profile.gst_verified,
        label: 'New Supplier',
        explanation: 'Insufficient transaction history to compute algorithmic Trust Score. Score will populate after initial orders are fulfilled and inspected.',
      });
    }

    const completedOrders = supplierOrders.filter(o =>
      ['completed', 'COMPLETED', 'delivered', 'DELIVERED', 'PAYMENT_RELEASED'].includes(o.status)
    ).length;

    const disputedOrders = supplierOrders.filter(o =>
      ['disputed', 'DISPUTED', 'refunded', 'REFUNDED'].includes(o.status)
    ).length;

    const completionRate = completedOrders / totalOrders;
    const disputeRate = disputedOrders / totalOrders;

    // Transparent mathematical methodology:
    // Base: 500
    // Fulfillment volume bonus: +15 per completed order (up to 200)
    // Fulfillment rate bonus: completionRate * 250
    // Dispute penalty: disputeRate * 350
    // GST verification bonus: +50
    const volumeBonus = Math.min(200, completedOrders * 15);
    const fulfillmentBonus = Math.round(completionRate * 250);
    const disputePenalty = Math.round(disputeRate * 350);
    const gstBonus = profile.gst_verified ? 50 : 0;

    const calculatedScore = Math.max(100, Math.min(1000, 500 + volumeBonus + fulfillmentBonus - disputePenalty + gstBonus));

    // Update profile in DB with real calculated score
    await supabase.from('profiles').update({
      trust_score: calculatedScore,
      total_orders: totalOrders,
      successful_orders: completedOrders,
      disputed_orders: disputedOrders,
    }).eq('id', userId);

    return NextResponse.json({
      userId,
      hasEnoughData: true,
      score: calculatedScore,
      totalOrders,
      completedOrders,
      disputedOrders,
      completionRate: Math.round(completionRate * 100),
      gstVerified: !!profile.gst_verified,
      label: calculatedScore >= 800 ? 'Elite Verified' : calculatedScore >= 600 ? 'Standard Partner' : 'Probationary',
      methodology: 'Transparent formula: 500 base + fulfillment track record (+15/order, max 200) + fulfillment success rate (+250) - dispute rate penalty (-350) + GST compliance bonus (+50).',
    });
  } catch (error: any) {
    console.error('Trust score API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
