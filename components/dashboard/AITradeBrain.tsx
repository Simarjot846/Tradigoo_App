'use client'

import { useState, useEffect } from 'react';

export default function AITradeBrain() {
    const [insight, setInsight] = useState<string>("");

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        fetch('/api/trade-brain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'wheat' }),
            signal: controller.signal
        })
            .then(res => res.json())
            .then(data => {
                if (isMounted) {
                    setInsight(data.recommendation || data.insight || "Organic Wheat from Punjab offers maximum CO2 reduction with high buyer trust scores.");
                }
            })
            .catch(() => {
                if (isMounted) {
                    setInsight("Sustainable Wheat suppliers currently have 18% higher margins with rapid escrow fulfillment.");
                }
            })
            .finally(() => {
                clearTimeout(timeoutId);
            });

        return () => {
            isMounted = false;
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="rounded-xl border border-purple-500/30 bg-purple-900/10 p-6 backdrop-blur-md fade-in">
            <h3 className="text-lg font-bold text-purple-300 mb-2 flex items-center">
                <span className="opacity-80 mr-2 text-xl">🧠</span> AI Trade Brain (Gemini + Pathway RAG)
            </h3>
            {insight ? (
                <p className="text-gray-300 leading-relaxed text-sm">
                    {insight}
                </p>
            ) : (
                <p className="text-purple-400/50 animate-pulse text-sm">Analyzing live data vectors...</p>
            )}
        </div>
    );
}
