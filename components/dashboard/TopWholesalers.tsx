'use client';
import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Box, RefreshCw } from 'lucide-react';

interface TopWholesaler {
    product: string;
    top_wholesaler: string;
    purchases: number;
}

export default function TopWholesalers() {
    const [data, setData] = useState<TopWholesaler[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStats = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/pathway-top-wholesalers', {
                signal: AbortSignal.timeout(3000)
            });
            if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json)) {
                    setData(json);
                }
            }
        } catch (e) {
            console.warn("Top wholesalers notice:", e);
        } finally {
            // Keep the spinner going for at least 500ms so the user feels the refresh action
            setTimeout(() => setIsRefreshing(false), 500);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const initialTimeout = setTimeout(() => {
            if (isMounted) fetchStats();
        }, 800);

        // Auto refresh every 20 seconds
        const interval = setInterval(fetchStats, 20000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, [fetchStats]);

    if (data.length === 0) return null;

    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-blue-500/20 shadow-lg animate-fade-in relative overflow-hidden group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-base sm:text-xl font-bold dark:text-white flex items-center gap-2 mb-1 sm:mb-2">
                        <Award className="w-5 h-5 text-blue-500 shrink-0" /> Best Wholesalers by Product
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Live rankings computed via Pathway Streaming based on active buyer purchases
                    </p>
                </div>
                <button
                    onClick={fetchStats}
                    disabled={isRefreshing}
                    className="p-2 sm:p-2.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all border border-transparent hover:border-blue-500/30 active:scale-95 disabled:opacity-50 ml-2 sm:ml-4 flex-shrink-0"
                    title="Refresh Live Data"
                >
                    <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-2.5 sm:space-y-3 relative">
                {/* Subtle loading overlay effect */}
                <div className={`absolute inset-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[1px] z-10 transition-opacity duration-300 pointer-events-none rounded-lg ${isRefreshing ? 'opacity-100' : 'opacity-0'}`}></div>

                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 transition-all group/item relative overflow-hidden gap-2">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/0 group-hover/item:bg-blue-500/50 transition-colors"></div>
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs sm:text-sm shadow-inner group-hover/item:scale-110 transition-transform shrink-0">
                                #{idx + 1}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors truncate max-w-[130px] sm:max-w-[220px]">{item.top_wholesaler}</h4>
                                <p className="text-[11px] sm:text-xs text-zinc-500 flex items-center gap-1 truncate"><Box className="w-3 h-3 text-zinc-400 shrink-0" /> {item.product}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold text-xs tracking-wide shadow-sm group-hover/item:border-emerald-500/50 transition-colors shrink-0 px-2 py-0.5 sm:px-2.5">
                            <TrendingUp className="w-3 h-3 mr-1" /> {item.purchases} sales
                        </Badge>
                    </div>
                ))}
            </div>
        </div>
    );
}
