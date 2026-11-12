'use client';
import { useEffect, useState } from 'react';

export default function GreenScoreMeter() {
    const [stats, setStats] = useState({
        total_carbon_saved: 0,
        total_waste_reduced: 0,
        total_green_score: 0
    });

    useEffect(() => {
        let isMounted = true;
        const fetchPathwayStats = async () => {
            try {
                const res = await fetch('/api/pathway-stats');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0 && isMounted) {
                        setStats(data[0]);
                    }
                }
            } catch (e) {
                // Silently fail if Pathway is not running
            }
        };

        // Fetch immediately and poll with reasonable 15s interval
        fetchPathwayStats();
        const interval = setInterval(fetchPathwayStats, 15000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Calculates an auto-updating score purely using CSS transitions
    const widthPercentage = Math.min((stats.total_green_score / 2000) * 100, 100);

    return (
        <div className="flex flex-col gap-2 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-300">Live Green Footprint</span>
                <span className="text-emerald-400">{Math.round(stats.total_green_score)} Pts</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                    style={{ width: `${widthPercentage}%` }}
                />
            </div>
            <div className="text-xs text-slate-500 mt-1">
                🌱 {Math.round(stats.total_carbon_saved)}kg CO2 saved | ♻️ {Math.round(stats.total_waste_reduced)}kg waste prevented
            </div>
        </div>
    );
}
