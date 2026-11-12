import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const wholesalersDB = [
    { product: "Organic Cotton", names: ["EcoFabrics Ltd", "GreenWeave Textiles", "PureThread Inc", "SustainaBale Co"] },
    { product: "Wheat", names: ["GreenHarvest Traders", "Punjab Golden Grain", "AgroPrime Organics", "PureYield Farms"] },
    { product: "Rice", names: ["Sustainable Grains Co", "Heritage Rice Mills", "Ludhiana Agrotech", "EcoGrain Exporters"] },
    { product: "Pulses", names: ["NaturePulse Suppliers", "Organic Dals India", "GreenBean Network", "SustainaPulses"] },
    { product: "Spices", names: ["Kerala Organics", "Aroma Naturals", "PureSpice Hub", "Deccan Flavors"] },
    { product: "Jute Bags", names: ["Bengal Jute Mill", "EcoCarry Bags", "GreenWeave Jute", "EarthSack Co"] }
];

export async function GET() {
    // Generate 4 dynamically rotating top wholesalers to simulate live Pathway clustering rankings
    const shuffledProducts = [...wholesalersDB].sort(() => 0.5 - Math.random()).slice(0, 4);

    const liveRankingsData = shuffledProducts.map(p => {
        const randomName = p.names[Math.floor(Math.random() * p.names.length)];
        const basePurchases = Math.floor(Math.random() * 80) + 70; // Generate between 70 to 150
        return {
            product: p.product,
            top_wholesaler: randomName,
            purchases: basePurchases + Math.floor(Math.random() * 20)
        };
    }).sort((a, b) => b.purchases - a.purchases);

    return NextResponse.json(liveRankingsData);
}
