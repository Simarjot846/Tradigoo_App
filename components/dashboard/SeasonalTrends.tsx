'use client';
import { useEffect, useState } from 'react';
import { Leaf, Sun, Zap, TrendingUp, TentTree } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SeasonalTrend {
    region: string;
    weather: string;
    festival: string;
    trending: string;
}

export default function SeasonalTrends() {
    const [trends, setTrends] = useState<SeasonalTrend[]>([]);

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;
        
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/pathway-seasonal', {
                    signal: AbortSignal.timeout(6000)
                });
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setTrends(json);
                }
            } catch (e) {
                console.warn("Seasonal trends notice:", e);
            }
        };

        // Delay initial fetch
        initialTimeout = setTimeout(fetchStats, 1200);
        
        // Refresh every 20s
        const interval = setInterval(fetchStats, 20000);
        
        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    if (trends.length === 0) return null;

    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-amber-500/20 shadow-lg animate-fade-in">
            <h2 className="text-base sm:text-xl font-bold dark:text-white flex items-center gap-2 mb-1 sm:mb-2">
                <Sun className="w-5 h-5 text-amber-500 shrink-0" /> Live Seasonal & Festive Demand
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">
                Powered by Pathway Stream mapping live weather & geographic events
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {trends.map((item, idx) => (
                    <div key={idx} className="relative overflow-hidden p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 group">
                        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TentTree className="w-14 h-14 sm:w-16 sm:h-16 text-amber-500" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-1.5 sm:gap-2">
                            <div className="flex justify-between items-start gap-2">
                                <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs">
                                    {item.region}
                                </Badge>
                                {item.festival !== "None" && (
                                    <span className="text-[10px] font-bold uppercase text-white bg-amber-600 px-2 py-0.5 rounded shadow shrink-0">
                                        {item.festival}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-white flex items-center gap-2 mt-0.5">
                                    {item.trending}
                                </h4>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                    <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0" /> Weather: {item.weather}
                                </p>
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3 flex items-center text-xs font-bold text-emerald-500">
                            <TrendingUp className="w-3 h-3 mr-1" /> High Demand Detected
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
