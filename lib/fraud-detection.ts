import { createClient } from '@/lib/supabase-client';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface FraudCheckResult {
    riskScore: number;
    riskLevel: RiskLevel;
    flags: string[];
    recommendation: string;
}

export async function checkFraudRisk(orderId: string, userId: string, role: string): Promise<FraudCheckResult> {
    const flags: string[] = [];
    let riskScore = 0.1; // Baseline risk

    // Mock checking DB for history
    // In a real app, we would query 'disputes' and 'users' tables

    if (role === 'retailer') {
        // Retailer Flags
        // Mock: if userId starts with certain char or random chance
        if (Math.random() > 0.7) {
            flags.push('High Dispute Rate (>15%)');
            riskScore += 0.4;
        }
        if (Math.random() > 0.8) {
            flags.push('Multiple Recent Disputes (30 days)');
            riskScore += 0.3;
        }
    } else if (role === 'wholesaler') {
        // Wholesaler Flags
        if (Math.random() > 0.9) {
            flags.push('Repeated Quality Complaints (SKU-123)');
            riskScore += 0.3;
        }
    }

    // Courier Flags (Contextual)
    if (Math.random() > 0.85) {
        flags.push('Courier Route Anomaly Detected');
        riskScore += 0.25;
    }

    // Determine Level
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore > 0.7) riskLevel = 'HIGH';
    else if (riskScore > 0.4) riskLevel = 'MEDIUM';

    return {
        riskScore: parseFloat(riskScore.toFixed(2)),
        riskLevel,
        flags,
        recommendation: riskLevel === 'HIGH' ? 'Extend Inspection to 48h & Manual Review' : 'Standard 24h Inspection'
    };
}

export async function updateTrustScore(userId: string, penaltyPoints: number) {
    // Mock function to update trust score
    console.log(`Penalizing user ${userId} by ${penaltyPoints} points`);
    return true;
}
