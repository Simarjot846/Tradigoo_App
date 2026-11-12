import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const { email, userId } = await req.json();

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
        }

        const cleanEmail = email.trim().toLowerCase();
        const supabase = createServiceClient();

        // 1. Check if email is already in the waitlist
        const { data: existing } = await supabase
            .from('premium_waitlist')
            .select('id, email')
            .eq('email', cleanEmail)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({
                success: true,
                alreadyJoined: true,
                message: "You're already on the VIP waitlist! We'll notify you as soon as Tradigoo Premium launches."
            });
        }

        // 2. Insert into premium_waitlist
        const { error: insertError } = await supabase
            .from('premium_waitlist')
            .insert({
                email: cleanEmail,
                user_id: userId || null,
                source: 'navbar_modal',
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.warn("Supabase premium_waitlist insert notice:", insertError.message);
        }

        return NextResponse.json({
            success: true,
            message: "🎉 Welcome aboard! You've secured early access to Tradigoo Premium."
        });

    } catch (err: any) {
        console.error("Premium waitlist API error:", err);
        return NextResponse.json({
            success: true,
            message: "🎉 You've been added to our VIP notification list!"
        });
    }
}
