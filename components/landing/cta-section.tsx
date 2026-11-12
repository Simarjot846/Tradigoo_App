"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CTASection() {
    return (
        <section className="py-16 sm:py-24 md:py-32 px-3 sm:px-6">
            <div className="container mx-auto max-w-6xl">
                <div
                    className="relative rounded-2xl sm:rounded-[3rem] overflow-hidden bg-zinc-900 dark:bg-black border border-zinc-800 dark:border-white/10 p-6 sm:p-12 md:p-24 text-center group shadow-2xl transition-all duration-500"
                >
                    {/* Animated Elements */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20 mask-image-gradient-to-b" />

                    {/* Animated Blobs */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-500/30 blur-[120px] rounded-full pointer-events-none"
                    />
                    <div
                        className="absolute top-1/4 left-1/4 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50" />

                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-8 tracking-tighter text-white drop-shadow-xl">
                            Ready to revolutionize <br /> your supply chain?
                        </h2>
                        <p className="text-sm sm:text-base md:text-xl text-zinc-300 mb-6 sm:mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            Join thousands of businesses using Tradigoo to source faster, safer, and smarter.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                            <Button asChild size="lg" className="h-12 sm:h-16 px-6 sm:px-12 rounded-full text-base sm:text-lg font-bold bg-white text-black hover:bg-blue-50 w-full sm:w-auto shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.6)] transition-all hover:scale-105 border-0">
                                <Link href="/auth/signup">
                                    Get Started Free
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="h-12 sm:h-16 px-6 sm:px-12 rounded-full text-base sm:text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white w-full sm:w-auto transition-all hover:scale-105 hover:border-white/40 shadow-lg">
                                <Link href="mailto:contact@tradigoo.com">
                                    Talk to Sales
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
