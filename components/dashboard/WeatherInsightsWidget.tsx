'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, ThermometerSun, TrendingUp, Calendar, Sparkles, ArrowUp, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface WeatherData {
    city: string;
    temp: number;
    condition: string;
    demand_multiplier: number;
    humidity?: number;
    wind_speed?: number;
    timestamp: string;
    product_predictions?: ProductPrediction[];
}

interface ProductPrediction {
    product: string;
    reason: string;
    demand_change: string;
    trend: string;
    icon: string;
}

interface Festival {
    name: string;
    days_until: number;
    status: string;
    products: string[];
    demand_increase: number;
    description: string;
}

interface WeatherInsights {
    current_weather: WeatherData;
    product_predictions: ProductPrediction[];
    upcoming_festivals: Festival[];
    insights_summary: string;
    timestamp: string;
}

export default function WeatherInsightsWidget() {
    const [insights, setInsights] = useState<WeatherInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;

        const fetchInsights = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            try {
                const res = await fetch('/api/pathway-weather-insights', { signal: controller.signal });
                if (res.ok && isMounted) {
                    const data = await res.json();
                    setInsights(data);
                    setLastUpdate(new Date().toLocaleTimeString());
                    setLoading(false);
                }
            } catch (e) {
                if (isMounted) {
                    setLoading(false);
                }
            } finally {
                clearTimeout(timeoutId);
            }
        };

        // Delay initial fetch to not block render
        initialTimeout = setTimeout(fetchInsights, 500);

        // Update every 2 minutes
        const interval = setInterval(fetchInsights, 120000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm':
                return <CloudRain className="w-8 h-8 text-blue-400" />;
            case 'Snow':
                return <CloudSnow className="w-8 h-8 text-blue-200" />;
            case 'Clear':
                return <Sun className="w-8 h-8 text-yellow-400" />;
            case 'Clouds':
                return <Cloud className="w-8 h-8 text-gray-400" />;
            default:
                return <Wind className="w-8 h-8 text-gray-400" />;
        }
    };

    const getDemandColor = (multiplier: number) => {
        if (multiplier >= 1.5) return 'text-red-500 dark:text-red-400';
        if (multiplier >= 1.2) return 'text-orange-500 dark:text-orange-400';
        if (multiplier >= 1.0) return 'text-yellow-500 dark:text-yellow-400';
        return 'text-green-500 dark:text-green-400';
    };

    const getDemandBadge = (multiplier: number) => {
        if (multiplier >= 1.5) return { label: 'High Demand', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
        if (multiplier >= 1.2) return { label: 'Elevated', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
        if (multiplier >= 1.0) return { label: 'Normal', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' };
        return { label: 'Low', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
    };

    if (loading) {
        return (
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-lg animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!insights) return null;

    const weather = insights.current_weather;
    const badge = getDemandBadge(weather.demand_multiplier);

    return (
        <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/50 via-emerald-900/40 to-teal-900/50 dark:from-indigo-950/60 dark:via-emerald-950/60 dark:to-teal-950/60 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-fade-in group">

                {/* Background glowing blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -ml-32 -mb-32 transition-transform group-hover:scale-125 duration-1000"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-4 bg-emerald-500/20 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/30 shrink-0">
                                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">Intelligence Stream</h2>
                                <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5 font-medium">
                                    Real-time meteorological analysis streaming into matching engine
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-100 border-emerald-400 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2 shrink-0">
                            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                            </span>
                            Live via Pathway
                        </Badge>
                    </div>

                    {/* Current Weather Display */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Real-Time Display */}
                        <div className="lg:col-span-2 group/card relative overflow-hidden bg-white/10 dark:bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 hover:border-emerald-400 transition-all duration-500 shadow-xl">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover/card:bg-emerald-500/30 duration-500"></div>

                            <div className="flex items-center justify-between mb-4 sm:mb-6 relative">
                                <div>
                                    <Badge className="bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40 mb-2 sm:mb-3 border border-emerald-500/50 shadow-lg text-[10px] sm:text-xs">Current Node</Badge>
                                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">{weather.city}</h3>
                                </div>
                                <div className="p-3 sm:p-4 bg-white/10 rounded-2xl border border-white/20 group-hover/card:scale-110 transition-transform duration-500 shadow-lg text-emerald-300">
                                    {getWeatherIcon(weather.condition)}
                                </div>
                            </div>

                            <div className="flex items-end gap-1 sm:gap-2 mb-4 sm:mb-6">
                                <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-2xl">{weather.temp}°</span>
                                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/50 mb-1 sm:mb-2">C</span>
                                <span className="ml-2 sm:ml-3 text-lg sm:text-xl lg:text-2xl font-bold text-emerald-300 mb-2 sm:mb-3 drop-shadow-md">{weather.condition}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 text-xs sm:text-sm text-white/90 mb-4 sm:mb-6 font-medium">
                                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                                    <Droplets className="w-4 h-4 sm:w-6 sm:h-6 text-blue-300 shrink-0" />
                                    <span className="truncate">{weather.humidity || 60}% Hum</span>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 shadow-inner">
                                    <Wind className="w-4 h-4 sm:w-6 sm:h-6 text-teal-300 shrink-0" />
                                    <span className="truncate">{weather.wind_speed || 5} km/h</span>
                                </div>
                            </div>

                            <div className="pt-4 sm:pt-5 border-t border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
                                <Badge variant="outline" className={`${badge.color} px-3 sm:px-4 py-1 sm:py-1.5 shadow-md flex-1 w-full sm:w-auto justify-center sm:flex-none text-xs`}>
                                    {badge.label}
                                </Badge>
                                <p className={`text-sm sm:text-base font-extrabold flex items-center gap-1.5 sm:gap-2 drop-shadow-md ${getDemandColor(weather.demand_multiplier)}`}>
                                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> {weather.demand_multiplier}x Multiplier
                                </p>
                            </div>
                        </div>

                        {/* Product Predictions */}
                        <div className="lg:col-span-3 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-xl">
                            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                                <div className="p-2.5 sm:p-3 bg-emerald-500/30 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                                </div>
                                <h4 className="font-extrabold text-lg sm:text-xl lg:text-2xl text-white drop-shadow-md">Active Real-Time Demands</h4>
                            </div>

                            <div className="grid gap-3 sm:gap-4">
                                {insights.product_predictions.slice(0, 3).map((pred, idx) => (
                                    <div
                                        key={idx}
                                        className="group/item flex items-start sm:items-center gap-3 sm:gap-5 p-3.5 sm:p-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] cursor-default"
                                    >
                                        <div className="text-2xl sm:text-3xl lg:text-4xl p-2.5 sm:p-4 bg-white/10 rounded-xl sm:rounded-2xl group-hover/item:scale-110 transition-all duration-300 shadow-md shrink-0">
                                            {pred.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 sm:mb-2 gap-1 sm:gap-2">
                                                <h5 className="font-extrabold text-base sm:text-lg lg:text-xl text-white group-hover/item:text-emerald-300 transition-colors drop-shadow-md truncate">
                                                    {pred.product}
                                                </h5>
                                                <Badge variant="outline" className="bg-emerald-500/30 text-emerald-100 border-emerald-400 font-bold px-2.5 sm:px-4 py-0.5 sm:py-1 text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.3)] w-fit shrink-0">
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                    {pred.demand_change} SURGE
                                                </Badge>
                                            </div>
                                            <p className="text-xs sm:text-sm text-emerald-50/80 line-clamp-2 group-hover/item:text-white transition-colors font-medium">
                                                {pred.reason}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Festivals */}
                    {insights.upcoming_festivals.length > 0 && (
                        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-purple-400/50 shadow-2xl">
                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-pink-500/20 rounded-full blur-[60px] animate-pulse"></div>
                            <div className="relative z-10 flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center">
                                <div className="p-3 sm:p-5 bg-purple-500/30 rounded-2xl border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex-shrink-0">
                                    <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-pink-300" />
                                </div>
                                <div className="flex-1 w-full min-w-0">
                                    <h4 className="font-extrabold text-lg sm:text-2xl text-white mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 drop-shadow-lg">
                                        Predictive Context Engine
                                        <Badge className="bg-pink-500/30 text-pink-100 border-pink-400 px-2.5 py-0.5 text-xs shadow-[0_0_10px_rgba(236,72,153,0.3)] w-fit">Active Factor</Badge>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                        {insights.upcoming_festivals.map((festival, idx) => (
                                            <div key={idx} className="flex flex-col gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/20 border border-purple-500/30">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h5 className="font-extrabold text-base sm:text-xl text-pink-200 truncate">{festival.name}</h5>
                                                    <Badge variant="outline" className="text-white border-pink-400 bg-pink-500/40 font-bold px-2 sm:px-3 text-[10px] sm:text-xs shrink-0">
                                                        {festival.status === 'ongoing' ? 'NOW' : `T-${festival.days_until}D`}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs sm:text-sm font-medium text-purple-100/90 line-clamp-2">{festival.description}</p>
                                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-0.5">
                                                    {festival.products.slice(0, 3).map((product, pidx) => (
                                                        <span key={pidx} className="text-[11px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-lg bg-pink-950/50 text-pink-200 border border-pink-500/40 shadow-sm">
                                                            {product}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Last Update */}
                    <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <p className="text-xs sm:text-sm font-bold text-emerald-200 flex items-center gap-2 drop-shadow-md">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse shrink-0"></span>
                            <span>{insights.insights_summary}</span>
                        </p>
                        <p className="text-xs text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest font-black shadow-inner self-start sm:self-auto">
                            SYNC: {lastUpdate}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
