import { createClient } from '@/lib/supabase-server';

export async function updateTrustScore(userId: string) {
    const supabase = await createClient();

    // 1. Fetch Stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('successful_orders, disputed_orders')
        .eq('id', userId)
        .single();

    if (!profile) return;

    // 2. Calculate Score
    // Logic: Base 100 + (Successful * 2) - (Disputes * 5)
    // Ensure strict penalties for disputes to simulate high stakes.
    let score = 100 + (profile.successful_orders * 2) - (profile.disputed_orders * 5);

    if (score < 0) score = 0; // No negative scores
    if (score > 1000) score = 1000; // Cap at 1000 "Elite"

    // 3. Update DB
    await supabase
        .from('profiles')
        .update({ trust_score: score })
        .eq('id', userId);

    return score;
}
