import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function GET(_request: NextRequest) {
    const supabase = createServiceClient();

    try {
        const now = new Date().toISOString();

        const { data: expiredOrders, error: findError } = await supabase
            .from('orders')
            .select('id, buyer_id, total_amount')
            .in('status', ['inspection', 'inspection_pending', 'INSPECTION_PENDING'])
            .lt('inspection_deadline', now);

        if (findError) throw findError;

        if (!expiredOrders || expiredOrders.length === 0) {
            return NextResponse.json({ message: 'No expired inspections found' });
        }

        const updatePromises = expiredOrders.map(async (order) => {
            return supabase
                .from('orders')
                .update({
                    status: 'completed',
                    updated_at: now
                })
                .eq('id', order.id);
        });

        await Promise.all(updatePromises);

        return NextResponse.json({
            success: true,
            message: `Auto-released ${expiredOrders.length} orders`,
            ids: expiredOrders.map(o => o.id)
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
