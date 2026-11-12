'use client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Activity, TrendingUp } from 'lucide-react';

interface SearchTrend {
    query: string;
    searches: number;
    trend: string;
}

export default function SearchFrequency() {
    const [trends, setTrends] = useState<SearchTrend[]>([]);

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;
        
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/pathway-search-trends');
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setTrends(json);
                }
            } catch (e) {
                console.error("Failed to load search trends");
            }
        };

        // Delay initial fetch
        initialTimeout = setTimeout(fetchStats, 1000);
        
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
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-lg animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-purple-500" /> Retailer Search Intelligence
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                What buyers are actively searching for right now. Add these to your inventory to maximize sales.
            </p>

            <div className="space-y-4">
                {trends.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-purple-50 dark:bg-zinc-950 border border-purple-100 dark:border-purple-900/30 group hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{item.query}</h4>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <span className="font-medium text-emerald-500">{item.trend}</span> growth this hour
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tighter">
                                {item.searches}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-zinc-400">Queries</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-purple-500 transition-colors hidden sm:block" />
                    </div>
                ))}
            </div>
        </div>
    );
}
