import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, code } = await request.json(); // action: 'generate' | 'verify'
    const admin = createServiceClient();

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isBuyer = order.buyer_id === session.userId;
    const isSeller = order.seller_id === session.userId;
    const isAdmin = session.role === 'founder' || session.role === 'employee';
    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const normalizedStatus = String(order.status || '').trim().toLowerCase();

    if (action === 'generate') {
      if (!['payment_in_escrow', 'shipped', 'courier_verified', 'delivered'].includes(normalizedStatus)) {
        return NextResponse.json({ error: 'Order is not eligible for delivery OTP.' }, { status: 400 });
      }

      const otp = order.otp || Math.floor(100000 + Math.random() * 900000).toString();
      const { error: updateErr } = await admin
        .from('orders')
        .update({
          otp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      return NextResponse.json({
        success: true,
        message: 'Delivery OTP ready for verification.',
      });
    }

    if (action === 'verify') {
      const cleanCode = typeof code === 'string' ? code.trim() : String(code || '').trim();
      if (!cleanCode) {
        return NextResponse.json({ error: 'Delivery OTP code is required.' }, { status: 400 });
      }

      if (!['shipped', 'courier_verified', 'delivered'].includes(normalizedStatus)) {
        return NextResponse.json(
          { error: 'Order must be shipped or delivered before verifying delivery OTP.' },
          { status: 400 }
        );
      }

      const expectedOtp = order.otp || order.otp_hash;
      if (expectedOtp && expectedOtp !== cleanCode) {
        return NextResponse.json({ error: 'Invalid OTP code. Please check and retry.' }, { status: 400 });
      }

      const now = new Date();
      const inspectionDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { error: verifyErr } = await admin
        .from('orders')
        .update({
          status: 'inspection',
          otp_verified: true,
          inspection_deadline: inspectionDeadline.toISOString(),
          delivered_at: order.delivered_at || now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', orderId);

      if (verifyErr) throw verifyErr;

      return NextResponse.json({
        success: true,
        status: 'inspection',
        message: 'Delivery OTP verified. 24-hour inspection window started.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'OTP operation failed' }, { status: 500 });
  }
}
