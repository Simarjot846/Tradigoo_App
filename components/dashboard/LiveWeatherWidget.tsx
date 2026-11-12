'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, ThermometerSun } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WeatherData {
    city: string;
    temp: number;
    condition: string;
    demand_multiplier: number;
    timestamp: string;
}

export default function LiveWeatherWidget() {
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchWeather = async () => {
            try {
                const res = await fetch('/api/pathway-weather');
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted && json.data) {
                        setWeatherData(json.data);
                        setLoading(false);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch weather:', e);
                setLoading(false);
            }
        };

        fetchWeather();
        const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm':
                return <CloudRain className="w-6 h-6 text-blue-400" />;
            case 'Snow':
                return <CloudSnow className="w-6 h-6 text-blue-200" />;
            case 'Clear':
                return <Sun className="w-6 h-6 text-yellow-400" />;
            case 'Clouds':
                return <Cloud className="w-6 h-6 text-gray-400" />;
            default:
                return <Wind className="w-6 h-6 text-gray-400" />;
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
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 shadow-lg animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 shadow-lg animate-fade-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold dark:text-white">Live Weather Impact</h2>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    <Droplets className="w-3 h-3 mr-1" /> Real-Time
                </Badge>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Weather conditions affecting demand across regions (via Pathway + OpenWeatherMap)
            </p>

            <div className="space-y-3">
                {weatherData.slice(0, 4).map((weather, idx) => {
                    const badge = getDemandBadge(weather.demand_multiplier);
                    return (
                        <div 
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {getWeatherIcon(weather.condition)}
                                <div>
                                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                                        {weather.city}
                                    </h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {weather.temp}°C • {weather.condition}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <Badge variant="outline" className={badge.color}>
                                    {badge.label}
                                </Badge>
                                <p className={`text-xs font-bold mt-1 ${getDemandColor(weather.demand_multiplier)}`}>
                                    {weather.demand_multiplier}x demand
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    Updates every 5 minutes • Powered by Pathway Real-Time Streaming
                </p>
            </div>
        </div>
    );
}
