import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(
    request: NextRequest
) {
    const supabase = await createClient();

    try {
        const { orderId, reason, evidenceUrls } = await request.json();

        if (!orderId || !reason) {
            return NextResponse.json({ error: 'Order ID and Reason required' }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        if (order.status !== 'INSPECTION_PENDING') {
            return NextResponse.json({ error: 'Dispute can only be raised during inspection window' }, { status: 400 });
        }

        // Auto-Resolution Logic (Mock AI Decision)
        let resolutionStatus = 'pending';
        let orderStatus = 'disputed';
        let resolutionNotes = 'Under Review';

        const reasonLower = reason.toLowerCase();

        if (reasonLower.includes('package') || reasonLower.includes('damage') || reasonLower.includes('courier') || reasonLower.includes('weight')) {
            // Logistics Fault
            resolutionStatus = 'logistics_fault';
            orderStatus = 'refunded'; // Retailer refunded
            resolutionNotes = 'Auto-detected Logistics Issue. Retailer Refunded. Insurance Claim Initiated.';
        } else if (reasonLower.includes('quality') || reasonLower.includes('fake') || reasonLower.includes('expiry') || reasonLower.includes('match') || reasonLower.includes('product')) {
            // Wholesaler Fault
            resolutionStatus = 'wholesaler_fault';
            orderStatus = 'refunded';
            resolutionNotes = 'Product Quality Issue. Wholesaler penalized. Retailer Refunded.';
        }

        const { error: disputeError } = await supabase.from('disputes').insert({
            order_id: orderId,
            raised_by: user.id,
            reason: reason,
            evidence_urls: evidenceUrls || [],
            status: resolutionStatus === 'pending' ? 'pending' : 'resolved',
            resolution_notes: resolutionNotes
        });

        if (disputeError) throw disputeError;

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: orderStatus,
                dispute_reason: reason,
                dispute_evidence: evidenceUrls || [],
                resolution_status: resolutionStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Dispute processed',
            resolution: resolutionNotes
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
