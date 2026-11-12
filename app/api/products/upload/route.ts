import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = 'product-images';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (session.role !== 'wholesaler' && session.role !== 'founder') {
      return NextResponse.json(
        { error: 'Only wholesalers or founders can upload product images.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload JPEG, PNG, WebP, or GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: 'Image is too large. Maximum allowed size is 5 MB.' },
        { status: 400 }
      );
    }

    const admin = createServiceClient();

    // Ensure bucket exists and is public
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await admin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_BYTES,
        allowedMimeTypes: ALLOWED_TYPES,
      });
    }

    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const ext = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt) ? rawExt : 'jpg';
    const fileName = `${session.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('[product-upload] Storage upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload image to storage.' },
        { status: 500 }
      );
    }

    const { data: urlData } = admin.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: uploadData.path,
    });
  } catch (error: any) {
    console.error('[product-upload] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during image upload.' },
      { status: 500 }
    );
  }
}
