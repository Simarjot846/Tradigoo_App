import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET() {
    try {
        const res = await fetch(`${PATHWAY_API}/search-trends`, {
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(1500),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
            throw new Error("Pathway search-trends unreachable");
        }
        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        // Fallback mock search trends for demo / offline
        const mockTrends = [
            { query: 'Organic Wheat', searches: 342, trend: '+45%' },
            { query: 'Basmati Rice', searches: 289, trend: '+32%' },
            { query: 'Cold Pressed Oil', searches: 195, trend: '+28%' },
            { query: 'Raw Cotton', searches: 142, trend: '+15%' }
        ];
        return NextResponse.json(mockTrends);
    }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

