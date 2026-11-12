"use client";

import { BrainCircuit, ShieldCheck, Truck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        icon: BrainCircuit,
        title: "AI Demand Prediction",
        description: "Our algorithm analyzes market trends to recommend products with the highest margin potential for your region.",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
    },
    {
        icon: ShieldCheck,
        title: "Escrow Security",
        description: "Funds are held securely in escrow until you verify the goods using our AI-verification system. Zero risk.",
        color: "text-green-400",
        bg: "bg-green-500/10",
    },
    {
        icon: Truck,
        title: "Smart Logistics",
        description: "Real-time tracking and optimized routing ensure your stock arrives faster and cheaper than traditional transport.",
        color: "text-orange-400",
        bg: "bg-orange-500/10",
    },
    {
        icon: Users,
        title: "Verified Community",
        description: "Connect strictly with KYC-verified wholesalers. No middlemen, no scams, just pure business.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
    },
];

export function Features() {
    return (
        <section className="py-24 relative bg-[#050505]">
            <div className="container px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                        Sourcing Reimagined
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Everything you need to scale your retail business, built into one powerful platform.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            
                            
                            
                            
                        >
                            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors h-full">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
