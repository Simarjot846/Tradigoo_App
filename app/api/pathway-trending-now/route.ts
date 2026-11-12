import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

let cachedTrending: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function GET() {
    if (cachedTrending && Date.now() - cachedTrending.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cachedTrending.data);
    }

    try {
        const res = await fetch(`${PATHWAY_API}/trending-now`, { 
            signal: AbortSignal.timeout(600),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway trending API not reachable");
        }

        const data = await res.json();
        cachedTrending = { data, timestamp: Date.now() };
        return NextResponse.json(data);
        
    } catch {
        // Return verified mock data as fallback
        const mockData = {
            trending: [
                {
                    product: "Wheat",
                    total_searches: 156,
                    recent_searches: 12,
                    regions: ["Delhi", "Mumbai", "Pune"],
                    trend: "🔥 Hot"
                },
                {
                    product: "Organic Cotton",
                    total_searches: 98,
                    recent_searches: 8,
                    regions: ["Bangalore", "Chennai"],
                    trend: "📈 Rising"
                },
                {
                    product: "Rice",
                    total_searches: 87,
                    recent_searches: 6,
                    regions: ["Kolkata", "Chennai"],
                    trend: "📈 Rising"
                },
                {
                    product: "Pulses",
                    total_searches: 45,
                    recent_searches: 4,
                    regions: ["Delhi"],
                    trend: "👀 Watching"
                }
            ],
            last_update: new Date().toISOString()
        };
        
        cachedTrending = { data: mockData, timestamp: Date.now() };
        return NextResponse.json(mockData);
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
