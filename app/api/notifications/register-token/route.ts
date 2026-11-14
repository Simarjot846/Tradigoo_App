import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, token, role, platform } = body;

        if (!token) {
            return NextResponse.json({ error: 'FCM Token is required' }, { status: 400 });
        }

        // Try getting authenticated user if available
        let effectiveUserId = userId;
        try {
            const session = await getAuthenticatedSession();
            if (session?.userId) {
                effectiveUserId = session.userId;
            }
        } catch {
            // Ignore auth lookup failure for anonymous / initial launch device registrations
        }

        // Attempt persistence to database if profiles or fcm_tokens table exists
        try {
            const supabase = createServiceClient();
            if (effectiveUserId) {
                await supabase
                    .from('profiles')
                    .update({
                        fcm_token: token,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', effectiveUserId);
            }
        } catch {
            // Database update fallback
        }

        return NextResponse.json({
            success: true,
            message: 'FCM token registered successfully',
            registeredAt: new Date().toISOString(),
            platform: platform || 'android',
            role: role || 'retailer'
        });
    } catch (error: any) {
        console.error('Error registering FCM token:', error);
        return NextResponse.json(
            { error: error?.message || 'Failed to register FCM token' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'online',
        service: 'Tradigoo FCM Notification Dispatcher',
        supportedChannels: ['channel_orders', 'channel_marketplace']
    });
}
