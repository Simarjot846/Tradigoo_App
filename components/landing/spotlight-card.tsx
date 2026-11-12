"use client";

import React from 'react';

export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`group relative border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden rounded-xl ${className} shadow-xl dark:shadow-none hover:shadow-2xl transition-all duration-300`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative h-full z-10 transition-transform duration-300 group-hover:-translate-y-1">
                {children}
            </div>
        </div>
    );
}
