import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

let cachedStats: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
    if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cachedStats.data);
    }

    try {
        const res = await fetch(`${PATHWAY_API}/global-stats`, { 
            signal: AbortSignal.timeout(600),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway not reachable");
        }

        const data = await res.json();
        const payload = Array.isArray(data) ? data : [data];
        cachedStats = { data: payload, timestamp: Date.now() };
        return NextResponse.json(payload);
    } catch {
        // Return baseline mock data as fallback
        const mockData = [{
            total_carbon_saved: Math.floor(400 + Math.random() * 100),
            active_orders: Math.floor(50 + Math.random() * 30),
            green_score_avg: Math.floor(85 + Math.random() * 10),
            timestamp: new Date().toISOString()
        }];
        cachedStats = { data: mockData, timestamp: Date.now() };
        return NextResponse.json(mockData);
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
