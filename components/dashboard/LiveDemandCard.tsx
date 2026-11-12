'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Info, Leaf, Zap, Award, Activity } from 'lucide-react';

// Custom tooltip with clear explanations
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value as number;
        const time = payload[0].payload.time;
        const trees = Math.round(value / 10);
        const cars = Math.round(value / 2.3); // avg car emits 2.3kg CO2 per gallon
        
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-emerald-500/70 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <p className="text-emerald-400 font-bold text-base">Carbon Impact</p>
                </div>
                <p className="text-white text-2xl font-bold mb-1">{value} kg CO₂</p>
                <p className="text-slate-400 text-xs mb-3">{time}</p>
                
                <div className="space-y-2 pt-3 border-t border-slate-700">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-2xl">🌳</span>
                        <span className="text-slate-300">
                            <span className="text-emerald-400 font-bold">{trees}</span> trees planted
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-2xl">🚗</span>
                        <span className="text-slate-300">
                            <span className="text-emerald-400 font-bold">{cars}</span> car trips avoided
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-2xl">💡</span>
                        <span className="text-slate-300">
                            <span className="text-emerald-400 font-bold">{Math.round(value * 0.12)}</span> hours of LED bulb
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function LiveDemandCard({ children }: { children?: React.ReactNode }) {
    const [data, setData] = useState<{ time: string, demand: number }[]>([]);
    const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
    const [changeRate, setChangeRate] = useState(0);
    const [milestone, setMilestone] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        let initialTimeout: NodeJS.Timeout;
        
        const fetchPathwayStats = async () => {
            try {
                const res = await fetch('/api/pathway-stats');
                if (res.ok) {
                    const stats = await res.json();
                    if (stats && Array.isArray(stats) && stats.length > 0) {
                        const currentScore = stats[0].total_carbon_saved || 400;
                        if (isMounted) {
                            setData(prev => {
                                const newData = [...prev];
                                const lastValue = newData.length > 0 ? newData[newData.length - 1].demand : currentScore;
                                
                                // Calculate change rate
                                const change = currentScore - lastValue;
                                setChangeRate(change);
                                
                                // Determine trend
                                if (currentScore > lastValue + 5) {
                                    setTrend('up');
                                } else if (currentScore < lastValue - 5) {
                                    setTrend('down');
                                } else {
                                    setTrend('stable');
                                }
                                
                                // Check for milestones
                                if (currentScore >= 500 && lastValue < 500) {
                                    setMilestone('🎉 500kg milestone reached!');
                                    setTimeout(() => setMilestone(null), 5000);
                                } else if (currentScore >= 1000 && lastValue < 1000) {
                                    setMilestone('🏆 1 Ton of CO₂ saved!');
                                    setTimeout(() => setMilestone(null), 5000);
                                }
                                
                                newData.push({
                                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                                    demand: currentScore
                                });
                                if (newData.length > 12) newData.shift(); // Show more data points
                                return newData;
                            });
                        }
                    }
                } else {
                    console.error("Failed to fetch pathway stats");
                }
            } catch (e) {
                console.error("Error fetching pathway stats:", e);
            }
        };

        // Delay initial fetch
        initialTimeout = setTimeout(fetchPathwayStats, 500);
        
        // Fetch every 15 seconds
        const interval = setInterval(fetchPathwayStats, 15000);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

    const latestValue = data.length > 0 ? data[data.length - 1].demand : 0;
    const treesEquivalent = Math.round(latestValue / 10);
    const carsAvoided = Math.round(latestValue / 2.3);
    const percentToNextMilestone = latestValue >= 1000 ? 100 : ((latestValue % 500) / 500) * 100;

    return (
        <div className="animate-fade-in flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 dark:bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-emerald-900/40 rounded-xl p-5 w-full h-[420px] relative overflow-hidden">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Milestone celebration */}
            {milestone && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm">
                        {milestone}
                    </div>
                </div>
            )}
            
            {/* Header with explanation */}
            <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Leaf className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-bold text-lg">Live Carbon Impact</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {trend === 'up' && (
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/20 px-2 py-1 rounded-full">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>+{changeRate}kg/5s</span>
                                    </div>
                                )}
                                {trend === 'down' && (
                                    <div className="flex items-center gap-1 text-orange-400 text-xs bg-orange-500/20 px-2 py-1 rounded-full">
                                        <TrendingDown className="w-3 h-3" />
                                        <span>{changeRate}kg/5s</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-slate-400 text-xs">
                                    <Activity className="w-3 h-3 animate-pulse" />
                                    <span>Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Info tooltip */}
                <div className="group relative">
                    <div className="p-2 bg-slate-800 rounded-lg cursor-help hover:bg-slate-700 transition-colors">
                        <Info className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="absolute right-0 top-12 w-72 bg-slate-800 border-2 border-emerald-500/30 rounded-xl p-4 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">
                            <span className="font-bold text-emerald-400 text-sm">What does this mean?</span><br/>
                            Every sustainable purchase on our platform saves carbon emissions. This graph tracks the total environmental impact across all retailers in real-time!
                        </p>
                        <div className="space-y-2 pt-3 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Zap className="w-3 h-3 text-emerald-400" />
                                <span>Updates every 5 seconds</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Award className="w-3 h-3 text-emerald-400" />
                                <span>Platform-wide total impact</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced stats grid */}
            {latestValue > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl p-3 border border-emerald-500/30">
                        <div className="flex items-center gap-2 mb-1">
                            <Leaf className="w-4 h-4 text-emerald-400" />
                            <p className="text-xs text-slate-400">Total Saved</p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">{latestValue}</p>
                        <p className="text-xs text-slate-500">kg CO₂</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-3 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🌳</span>
                            <p className="text-xs text-slate-400">Trees</p>
                        </div>
                        <p className="text-2xl font-bold text-green-400">{treesEquivalent}</p>
                        <p className="text-xs text-slate-500">planted</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-3 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">🚗</span>
                            <p className="text-xs text-slate-400">Cars</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">{carsAvoided}</p>
                        <p className="text-xs text-slate-500">trips saved</p>
                    </div>
                </div>
            )}

            {/* Progress to next milestone */}
            {latestValue > 0 && latestValue < 1000 && (
                <div className="mb-3 relative z-10">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Next milestone</span>
                        <span className="text-emerald-400 font-semibold">
                            {latestValue < 500 ? '500kg' : '1000kg (1 Ton)'}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500 rounded-full"
                            style={{ width: `${percentToNextMilestone}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="flex-1 w-full min-h-0 relative z-10">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis 
                                dataKey="time" 
                                stroke="#64748b" 
                                fontSize={10}
                                tickLine={false}
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={10} 
                                tickFormatter={(v) => `${v}kg`} 
                                domain={['auto', 'auto']}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="demand" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                fill="url(#colorDemand)"
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#064e3b' }} 
                                activeDot={{ r: 7, fill: '#10b981', strokeWidth: 3, stroke: '#064e3b' }} 
                                isAnimationActive={true}
                                animationDuration={800}
                                name="Carbon Saved"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-sm text-slate-500 gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 animate-ping">
                                <Leaf className="w-10 h-10 text-emerald-500/50" />
                            </div>
                            <Leaf className="w-10 h-10 text-emerald-500 relative" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-slate-400">Loading live data...</p>
                            <p className="text-xs text-slate-600 mt-1">Connecting to Pathway stream</p>
                        </div>
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
