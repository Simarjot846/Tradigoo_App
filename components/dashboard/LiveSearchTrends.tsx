'use client';

import { useEffect, useState } from 'react';
import { Search, TrendingUp, Eye, Flame, Activity, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SearchEvent {
    product: string;
    region: string;
    timestamp: string;
    user_type: string;
}

interface TrendingProduct {
    product: string;
    total_searches: number;
    recent_searches: number;
    regions: string[];
    trend: string;
}

interface LiveSearchData {
    searches: SearchEvent[];
    total_searches: number;
    searches_per_minute: number;
    timestamp: string;
}

interface TrendingData {
    trending: TrendingProduct[];
    last_update: string;
}

// Configuration flag: Set to true when connected to real production search traffic
const IS_LIVE_DATA_CONNECTED = false;

interface LiveSearchTrendsProps {
    isLiveDataConnected?: boolean;
}

export default function LiveSearchTrends({
    isLiveDataConnected = IS_LIVE_DATA_CONNECTED
}: LiveSearchTrendsProps = {}) {
    const [liveSearches, setLiveSearches] = useState<SearchEvent[]>([]);
    const [trending, setTrending] = useState<TrendingProduct[]>([]);
    const [searchesPerMinute, setSearchesPerMinute] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchLiveSearches = async () => {
            try {
                setIsUpdating(true);
                const res = await fetch('/api/pathway-live-searches');
                if (res.ok) {
                    const data: LiveSearchData = await res.json();
                    if (isMounted) {
                        setLiveSearches(data.searches || []);
                        setSearchesPerMinute(data.searches_per_minute || 0);
                        setLastUpdateTime(new Date().toLocaleTimeString());
                        setLoading(false);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch live searches:', e);
                setLoading(false);
            } finally {
                setIsUpdating(false);
            }
        };

        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/pathway-trending-now');
                if (res.ok) {
                    const data: TrendingData = await res.json();
                    if (isMounted) {
                        setTrending(data.trending || []);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch trending:', e);
            }
        };

        // Initial fetch with delay to not block initial render
        const searchTimeout = setTimeout(() => {
            fetchLiveSearches();
            fetchTrending();
        }, 500);

        // Update live searches every 15 seconds
        const searchInterval = setInterval(fetchLiveSearches, 15000);
        
        // Update trending every 30 seconds
        const trendingInterval = setInterval(fetchTrending, 30000);

        return () => {
            isMounted = false;
            clearTimeout(searchTimeout);
            clearInterval(searchInterval);
            clearInterval(trendingInterval);
        };
    }, []);

    const getProductEmoji = (product: string) => {
        const emojiMap: Record<string, string> = {
            'Wheat': '🌾',
            'Rice': '🍚',
            'Organic Cotton': '👕',
            'Pulses': '🫘',
            'Spices': '🌶️',
            'Oils': '🛢️',
            'Grains': '🌾',
            'Sweeteners': '🍯',
            'Beverages': '☕',
            'Fashion': '👗',
            'Electronics': '⌚',
            'Body Care': '🧴',
            'Bath Products': '🛁'
        };
        return emojiMap[product] || '📦';
    };

    const getTrendIcon = (trend: string) => {
        if (trend.includes('Hot')) return <Flame className="w-4 h-4 text-red-500" />;
        if (trend.includes('Rising')) return <TrendingUp className="w-4 h-4 text-orange-500" />;
        return <Eye className="w-4 h-4 text-blue-500" />;
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
        
        if (seconds < 5) return 'just now';
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    if (loading) {
        return (
            <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-lg animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Live Search Card */}
            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 shadow-lg animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Activity className={`w-6 h-6 text-purple-500 ${isUpdating ? 'animate-pulse' : ''}`} />
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold dark:text-white">Live Search Activity</h2>
                            {!isLiveDataConnected && (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-semibold px-2 py-0.5">
                                    PREVIEW
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isUpdating && (
                            <span className="text-xs text-purple-500 animate-pulse">Updating...</span>
                        )}
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                            <Activity className="w-3 h-3 mr-1" /> 
                            {lastUpdateTime || (isLiveDataConnected ? 'Live Stream' : 'Sample Feed')}
                        </Badge>
                    </div>
                </div>
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {isLiveDataConnected
                        ? 'Real-time product searches from buyers across India • Updates every 2 seconds via Pathway'
                        : 'Illustrative demo data — live activity coming soon'}
                </p>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Search className="w-4 h-4 text-purple-500" />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Searches/Min</p>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{searchesPerMinute}</p>
                    </div>
                    
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Trending Now</p>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{trending.length}</p>
                    </div>
                    
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Tracked</p>
                        </div>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{liveSearches.length}</p>
                    </div>
                </div>

                {/* Trending Products */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-500" />
                        Trending Products Right Now
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {trending.slice(0, 6).map((item, idx) => (
                            <div 
                                key={idx}
                                className="bg-white/50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 hover:border-purple-500/30 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getProductEmoji(item.product)}</span>
                                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                                             {item.product}
                                        </h4>
                                    </div>
                                    {getTrendIcon(item.trend)}
                                </div>
                                
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-600 dark:text-zinc-400">
                                        {item.total_searches} searches
                                    </span>
                                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                        {item.trend}
                                    </Badge>
                                </div>
                                
                                {item.regions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {item.regions.slice(0, 3).map((region, ridx) => (
                                            <Badge key={ridx} variant="outline" className="text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                {region}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Search Stream */}
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Live Search Stream
                    </h3>
                    
                    <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 max-h-64 overflow-y-auto">
                        {liveSearches.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                                <p className="text-sm">
                                    {isLiveDataConnected ? 'Waiting for live searches...' : 'Loading sample search activity...'}
                                </p>
                                <p className="text-xs mt-1">
                                    {isLiveDataConnected ? 'Make sure Pathway backend is running' : 'Demo stream initializing'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {liveSearches.slice(0, 10).map((search, idx) => (
                                    <div 
                                        key={`${search.timestamp}-${idx}`}
                                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 animate-fade-in"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-xl">{getProductEmoji(search.product)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                                                    {search.product}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {search.region} • {search.user_type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {idx === 0 && (
                                                <span className="flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                            )}
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap ml-2">
                                                {getTimeAgo(search.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {isLiveDataConnected
                                ? 'Powered by Pathway Real-Time Streaming • Updates every 5 seconds'
                                : 'Simulated activity for preview purposes'}
                        </p>
                        {liveSearches.length === 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                {isLiveDataConnected ? 'Waiting for Pathway backend...' : 'Initializing preview stream...'}
                            </p>
                        )}
                        {liveSearches.length > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                {isLiveDataConnected
                                    ? `Connected • ${liveSearches.length} searches tracked`
                                    : `Preview Mode • ${liveSearches.length} sample searches loaded`}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
