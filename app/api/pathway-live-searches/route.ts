import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET() {
    try {
        const res = await fetch(`${PATHWAY_API}/live-searches`, { 
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(3000),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway live searches API not reachable");
        }

        const data = await res.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Pathway live searches error:', error);
        
        // Return mock data as fallback
        const mockData = {
            searches: [
                {
                    product: "Wheat",
                    region: "Delhi",
                    timestamp: new Date().toISOString(),
                    user_type: "retailer"
                },
                {
                    product: "Rice",
                    region: "Mumbai",
                    timestamp: new Date(Date.now() - 2000).toISOString(),
                    user_type: "wholesaler"
                },
                {
                    product: "Organic Cotton",
                    region: "Bangalore",
                    timestamp: new Date(Date.now() - 5000).toISOString(),
                    user_type: "retailer"
                }
            ],
            total_searches: 3,
            searches_per_minute: 45,
            timestamp: new Date().toISOString()
        };
        
        return NextResponse.json(mockData);
    }
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
