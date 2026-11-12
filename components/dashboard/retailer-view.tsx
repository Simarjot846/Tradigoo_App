"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, TrendingUp, ShoppingCart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export function RetailerView() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pb-20 bg-zinc-950 relative selection:bg-blue-500/30">
            {/* Global Background Effects matching Marketplace */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-zinc-950 to-zinc-950" />
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            <div className="container mx-auto px-6 py-10 relative z-10">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center mb-12">
                    <div
                        
                        
                        className="max-w-3xl"
                    >
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30 px-3 py-1">
                                <Sparkles className="w-3 h-3 mr-2" />
                                AI-Powered Insights
                            </Badge>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white">
                            Retail <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Intelligence.</span>
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                            Welcome back, <span className="text-white font-medium">{user?.business_name || 'Partner'}</span>.
                            Here are the top-selling opportunities in <span className="text-white font-medium">{user?.location || 'your area'}</span> today.
                        </p>

                        {/* Marketplace Style Search Bar */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md shadow-2xl max-w-2xl mx-auto">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 group-hover:text-zinc-300 transition-colors w-5 h-5" />
                                <Input
                                    placeholder="Ask AI: 'What's trending in laptops?' or search products..."
                                    className="pl-12 bg-black/40 border-white/5 text-white placeholder:text-zinc-500 focus:bg-black/60 transition-all h-14 text-lg rounded-xl"
                                />
                                <Button className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-6">
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Recommendations Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Trending Near You</h2>
                                <p className="text-sm text-zinc-500">High demand items in your pincode</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-zinc-400 hover:text-white group">
                            View All Analysis <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <ScrollArea className="w-full whitespace-nowrap pb-4">
                        <div className="flex gap-6 pb-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <ProductCard key={i} index={i} />
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="bg-zinc-800/50" />
                    </ScrollArea>
                </section>

                {/* Categories Grid (Marketplace Style) */}
                <section>
                    <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                        Browse by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty'].map((cat, i) => (
                            <div
                                key={i}
                                
                                
                            >
                                <Card className="bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 cursor-pointer h-40 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <CardContent className="flex flex-col items-center justify-center h-full relative z-10">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">{cat}</span>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function ProductCard({ index }: { index: number }) {
    return (
        <div
            className="inline-block w-[320px]"
            
            
            
        >
            <div className="group h-full flex flex-col rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer relative">

                <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-0 shadow-lg font-medium px-3">
                        <TrendingUp className="w-3 h-3 mr-1" /> High Demand
                    </Badge>
                </div>

                <div className="h-48 relative overflow-hidden bg-zinc-950">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700 bg-zinc-800/50 group-hover:scale-105 transition-transform duration-500">
                        <span className="text-6xl">⌚</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate">Smart Watch Pro</h3>
                        {/* Rating shown only when real rating data exists */}
                    </div>
                    <p className="text-sm text-zinc-500 mb-4 line-clamp-2">Best-selling smartwatch with heart rate monitoring.</p>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-semibold">Margin</p>
                            <p className="text-emerald-400 font-bold text-lg">+45%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500 uppercase font-semibold">Price</p>
                            <p className="text-white font-bold text-lg">₹1,299</p>
                        </div>
                    </div>

                    <Button className="w-full bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] transition-all font-semibold rounded-xl">
                        Add to Stock
                    </Button>
                </div>
            </div>
        </div>
    )
}
