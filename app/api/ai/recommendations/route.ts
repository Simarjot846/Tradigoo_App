import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user location to "personalize"
        const { data: profile } = await supabase.from('profiles').select('location').eq('id', user.id).single();
        const location = profile?.location || 'General';

        // Mock AI Logic (Rule-based)
        // "Analyzes" demand in location.

        // Static set of recommendations based on "location" hash or random
        const recommendations = [
            {
                name: "Smart Watch Series 7",
                category: "Electronics",
                demand: "High",
                margin: "45%",
                reason: `High search volume in ${location} for wearables.`,
                supplier: "TechWholesale Ltd",
                trust_score: 98
            },
            {
                name: "Organic Cotton T-Shirts",
                category: "Fashion",
                demand: "Medium",
                margin: "30%",
                reason: "Increasing trend for sustainable materials.",
                supplier: "GreenThreads India",
                trust_score: 92
            },
            {
                name: "Wireless Earbuds Pro",
                category: "Electronics",
                demand: "High",
                margin: "55%",
                reason: "Top selling accessory paired with new phone launches.",
                supplier: "AudioKing",
                trust_score: 85
            }
        ];

        return NextResponse.json({
            location: location,
            insights: `Market analysis for ${location} indicates a surge in electronics demand.`,
            recommendations: recommendations
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
