import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createServiceClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, business_name, role, gst_verified, trust_score, total_orders, successful_orders, disputed_orders')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const isWholesaler = profile.role === 'wholesaler';
    const orderFilterCol = isWholesaler ? 'seller_id' : 'buyer_id';

    const { data: orders } = await supabase
      .from('orders')
      .select('id, status, total_amount')
      .eq(orderFilterCol, userId);

    const userOrders = orders || [];
    const totalOrders = userOrders.length;

    if (totalOrders === 0) {
      const baselineScore = profile.gst_verified ? 550 : (profile.trust_score || 500);
      return NextResponse.json({
        userId,
        hasEnoughData: false,
        score: baselineScore,
        totalOrders: 0,
        completedOrders: 0,
        disputedOrders: 0,
        gstVerified: !!profile.gst_verified,
        label: profile.gst_verified ? 'GST Verified Partner' : 'New Partner',
        methodology: 'Baseline score starts at 500 (+50 GST verification). Increases dynamically as escrow orders complete without disputes.',
      });
    }

    const completedOrders = userOrders.filter((o) =>
      ['completed', 'COMPLETED', 'delivered', 'DELIVERED', 'PAYMENT_RELEASED'].includes(o.status)
    ).length;

    const disputedOrders = userOrders.filter((o) =>
      ['disputed', 'DISPUTED', 'refunded', 'REFUNDED'].includes(o.status)
    ).length;

    const activeEscrowOrders = userOrders.filter((o) =>
      ['payment_in_escrow', 'PAYMENT_HELD', 'shipped', 'courier_verified', 'inspection'].includes(o.status)
    ).length;

    const completionRate = completedOrders / totalOrders;
    const disputeRate = disputedOrders / totalOrders;

    const volumeBonus = Math.min(200, completedOrders * 15 + activeEscrowOrders * 5);
    const fulfillmentBonus = Math.round(completionRate * 250);
    const disputePenalty = Math.round(disputeRate * 350);
    const gstBonus = profile.gst_verified ? 50 : 0;

    const calculatedScore = Math.max(
      100,
      Math.min(1000, 500 + volumeBonus + fulfillmentBonus - disputePenalty + gstBonus)
    );

    await supabase
      .from('profiles')
      .update({
        trust_score: calculatedScore,
        total_orders: totalOrders,
        successful_orders: completedOrders,
        disputed_orders: disputedOrders,
      })
      .eq('id', userId);

    return NextResponse.json({
      userId,
      hasEnoughData: true,
      score: calculatedScore,
      totalOrders,
      completedOrders,
      disputedOrders,
      completionRate: Math.round(completionRate * 100),
      gstVerified: !!profile.gst_verified,
      label:
        calculatedScore >= 750
          ? 'Verified Premier'
          : calculatedScore >= 600
          ? 'Verified Standard'
          : calculatedScore >= 350
          ? 'Standard Partner'
          : 'Under Review',
      methodology:
        'Transparent formula: 500 base + fulfillment track record (+15/completed order, +5/active escrow, max 200) + completion rate (+250) - dispute penalty (-350) + GST compliance (+50).',
    });
  } catch (error: any) {
    console.error('Trust score API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
