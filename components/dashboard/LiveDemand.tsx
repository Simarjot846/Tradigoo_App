'use client'

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveDemand() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        let isMounted = true;
        const defaultDemand = [
            { area: 'Delhi NCR', demand: 780 },
            { area: 'Mumbai', demand: 920 },
            { area: 'Bengaluru', demand: 640 },
            { area: 'Punjab', demand: 850 },
            { area: 'Gujarat', demand: 710 }
        ];

        const fetchDemand = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);

            try {
                const res = await fetch('/api/pathway-stats', { signal: controller.signal });
                if (res.ok && isMounted) {
                    const json = await res.json();
                    if (Array.isArray(json) && json.length > 0) {
                        setData(json);
                        return;
                    }
                }
                if (isMounted) setData(defaultDemand as any);
            } catch (err) {
                if (isMounted) setData(defaultDemand as any);
            } finally {
                clearTimeout(timeoutId);
            }
        };

        fetchDemand();
        const interval = setInterval(fetchDemand, 15000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md fade-in">
            <h3 className="mb-4 text-xl font-bold text-white">Live Regional Demand (Pathway Streams)</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <XAxis dataKey="area" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333' }} />
                        <Area type="monotone" dataKey="demand" stroke="#10b981" fill="url(#colorDemand)" />
                        <defs>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
