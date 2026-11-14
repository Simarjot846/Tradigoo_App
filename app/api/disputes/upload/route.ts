import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos allowed.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    const admin = createServiceClient();
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .or(`buyer_id.eq.${session.userId},seller_id.eq.${session.userId}`)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
    }

    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.userId}/${orderId}/${timestamp}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await admin.storage
      .from('dispute-evidence')
      .upload(fileName, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage
      .from('dispute-evidence')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uploadData.path,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
