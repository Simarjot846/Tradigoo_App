import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id: orderId } = await params;

    try {
        const { action, code } = await request.json(); // action: 'generate' | 'verify'

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        if (action === 'generate') {
            if (order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
                return NextResponse.json({ error: 'Order not in transit' }, { status: 400 });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date();
            expiry.setMinutes(expiry.getMinutes() + 15);

            await supabase
                .from('orders')
                .update({
                    otp_hash: otp,
                    otp_expiry: expiry.toISOString()
                })
                .eq('id', orderId);



            return NextResponse.json({ success: true, message: 'OTP sent to registered mobile' });
        }

        if (action === 'verify') {
            if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

            if (order.otp_hash !== code) {
                return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
            }

            const now = new Date();
            const expiry = new Date(order.otp_expiry);
            if (now > expiry) {
                return NextResponse.json({ error: 'OTP Expired' }, { status: 400 });
            }

            // Transition to INSPECTION_PENDING directly for smoother flow
            const inspectionDeadline = new Date();
            inspectionDeadline.setHours(inspectionDeadline.getHours() + 24);

            await supabase
                .from('orders')
                .update({
                    status: 'INSPECTION_PENDING',
                    otp_verified: true,
                    otp_hash: null,
                    inspection_deadline: inspectionDeadline.toISOString(),
                    updated_at: now.toISOString()
                })
                .eq('id', orderId);

            return NextResponse.json({ success: true, status: 'INSPECTION_PENDING' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
