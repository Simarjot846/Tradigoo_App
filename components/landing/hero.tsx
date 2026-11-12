"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function Hero() {
    const router = useRouter();

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="container relative z-10 px-6 mx-auto text-center">
                <div
                    
                    
                    
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8 hover:bg-white/10 transition-colors cursor-default">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 anime-pulse"></span>
                        <span className="text-sm font-medium text-gray-300">AI-Powered Sourcing Live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                        <span className="block text-white mb-2">Sourcing Made</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                            Intelligent.
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10 leading-relaxed">
                        Tradigoo connects verified retailers with wholesalers using AI-driven insights,
                        escrow security, and real-time logistics.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            size="lg"
                            onClick={() => router.push('/dashboard')}
                            className="w-full sm:w-auto h-12 px-8 text-base bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] md:min-w-[180px]"
                        >
                            Start Sourcing Free
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto h-12 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm"
                        >
                            <PlayCircle className="mr-2 h-5 w-5" />
                            Watch Demo
                        </Button>
                    </div>
                </div>

                {/* Dashboard Preview / Floating UI */}
                <div
                    
                    
                    
                    className="relative mx-auto max-w-5xl mt-16 perspective-1000"
                >
                    <div className="relative rounded-xl border border-white/10 bg-[#0A0A0A]/50 backdrop-blur-xl shadow-2xl p-2 md:p-4 rotate-x-12 transform-gpu transition-all duration-500 hover:rotate-0">
                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            className="rounded-lg w-full shadow-2xl border border-white/5 opacity-80 hover:opacity-100 transition-opacity"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent h-full w-full pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
}
