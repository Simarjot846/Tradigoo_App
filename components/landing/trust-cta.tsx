"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function TrustCTA() {
    const router = useRouter();

    return (
        <section className="py-32 relative flex items-center justify-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-[#0A0A0A]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />

            <div className="container px-6 mx-auto relative z-10 text-center">
                <div
                    
                    
                    
                    
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white tracking-tight">
                        Ready to <span className="text-blue-500">Upgrade</span> Your Supply Chain?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">
                        Join 5,000+ smart retailers saving 20% on sourcing costs today.
                    </p>

                    <Button
                        size="lg"
                        onClick={() => router.push('/dashboard')}
                        className="h-16 px-12 text-lg rounded-full bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)] transition-all"
                    >
                        Start Sourcing Now - Free
                    </Button>

                    <p className="mt-8 text-sm text-gray-500">
                        No credit card required • <span className="text-green-500">Verified Suppliers Only</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
