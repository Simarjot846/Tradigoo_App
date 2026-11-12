import { NextResponse } from 'next/server';

const PATHWAY_API = process.env.PATHWAY_API_URL || 'http://localhost:8081';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');
        
        const endpoint = city 
            ? `${PATHWAY_API}/live-weather/${city}`
            : `${PATHWAY_API}/live-weather`;
        
        const res = await fetch(endpoint, { 
            next: { revalidate: 0 },
            signal: AbortSignal.timeout(3000),
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!res.ok) {
            throw new Error("Pathway weather API not reachable");
        }

        const data = await res.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('Pathway weather error:', error);
        
        // Return mock weather data as fallback
        const mockWeather = {
            city: "Delhi",
            temp: 25.5,
            condition: "Clear",
            demand_multiplier: 1.0,
            timestamp: new Date().toISOString()
        };
        
        return NextResponse.json({ data: [mockWeather] });
    }
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
