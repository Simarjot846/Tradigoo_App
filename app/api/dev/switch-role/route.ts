import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { NextResponse } from 'next/server';

export async function POST() {
    const session = await getAuthenticatedSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.role === 'founder' || session.role === 'employee') {
        return NextResponse.json({ error: 'Privileged roles cannot be switched.' }, { status: 403 });
    }

    const supabase = createServiceClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.userId)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newRole = profile.role === 'retailer' ? 'wholesaler' : 'retailer';

    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', session.userId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, newRole });
}
