"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface MarketData {
    timestamp: string;
    commodity: string;
    mandi: string;
    price: number;
    volume: number;
}

export function LiveMarketTicker() {
    const [data, setData] = useState<MarketData[]>([]);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);

            try {
                const response = await fetch("/live_market.json", {
                    signal: controller.signal,
                    next: { revalidate: 15 }
                });
                if (response.ok && isMounted) {
                    const jsonData = await response.json();
                    if (Array.isArray(jsonData)) {
                        setData(jsonData.slice(-5));
                    } else {
                        setData([jsonData]);
                    }
                    setLastUpdated(new Date().toLocaleTimeString());
                }
            } catch (error) {
                // Silently handle if file not yet generated
            } finally {
                clearTimeout(timeoutId);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Poll every 15 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (data.length === 0) {
        return null;
        // Or return a loading state
        // return <div className="p-4 text-center text-muted-foreground">Waiting for live market stream...</div>;
    }

    return (
        <Card className="mb-6 border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/10">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
                        Live Market Intelligence (Powered by Pathway)
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        Live Updates: {lastUpdated}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-zinc-500">{item.mandi}</span>
                                <span className="font-bold text-lg">{item.commodity}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-xl">₹{item.price.toFixed(2)}</span>
                                {/* meaningful trend simulation */}
                                <div className="flex items-center text-xs text-green-600">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    +1.2%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
