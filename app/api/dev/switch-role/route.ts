import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch current profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const newRole = profile.role === 'retailer' ? 'wholesaler' : 'retailer';

    // Update role
    const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, newRole });
}
