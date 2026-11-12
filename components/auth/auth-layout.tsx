'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
    children: ReactNode;
    heroContent?: ReactNode;
}

export function AuthLayout({ children, heroContent }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex">
            {/* Left Panel - Hero Section (Hidden on mobile/tablet) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-[#120e24] relative overflow-hidden items-center justify-center p-12 border-r border-white/5">
                {/* Ambient Radial Highlights */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-indigo-950/40 to-transparent" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* Hero Content */}
                <div className="relative z-10 max-w-lg w-full">
                    <div className="mb-8">
                        <Link href="/" className="inline-block">
                            <div className="p-2.5 bg-white rounded-2xl shadow-lg border border-white/20 inline-flex items-center hover:opacity-95 transition-opacity">
                                <Image
                                    src="/tradigoo-full-logo.png"
                                    alt="Tradigoo"
                                    width={170}
                                    height={56}
                                    className="h-9 w-auto object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>
                    {heroContent || (
                        <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
                                B2B Wholesale Commerce
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                Trading made <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Simple</span>.
                            </h1>
                            <p className="text-zinc-400 text-base leading-relaxed mb-8">
                                Connect directly with trusted retailers and wholesalers. Seamless transactions with verified partners across India.
                            </p>

                            {/* Genuine Platform Feature Highlights */}
                            <div className="space-y-3.5">
                                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 text-base">
                                        🛡️
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">Escrow-Protected Payments</div>
                                        <div className="text-zinc-400 text-xs mt-0.5">Funds remain secure until goods are verified & accepted.</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 text-base">
                                        🏭
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">Verified Supplier Network</div>
                                        <div className="text-zinc-400 text-xs mt-0.5">Direct manufacturer connections with transparent wholesale pricing.</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 text-base">
                                        📊
                                    </div>
                                    <div>
                                        <div className="text-white text-sm font-semibold">Algorithmic Trust Score</div>
                                        <div className="text-zinc-400 text-xs mt-0.5">Real-time credibility score computed from order and dispute history.</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel - Form Section (Full width on mobile, comfortable padding) */}
            <div className="w-full lg:w-1/2 bg-white dark:bg-zinc-950 flex items-start lg:items-center justify-center p-4 sm:p-8 lg:p-12 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] relative min-h-screen overflow-y-auto">
                {/* Ensures content is never hidden behind Android/iOS system navigation bar or back buttons */}
                <div
                    className="w-full max-w-md space-y-6 sm:space-y-8 pt-2 pb-32 sm:pb-12"
                    style={{ paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 4rem), 6.5rem)' }}
                >
                    {children}
                </div>

                {/* Mobile background branding */}
                <div className="lg:hidden absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/50 dark:from-zinc-900 to-white dark:to-zinc-950 pointer-events-none" />
            </div>
        </div>
    );
}
