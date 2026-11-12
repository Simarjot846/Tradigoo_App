"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingUp, Users, DollarSign, Search, Filter, MoreHorizontal, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function WholesalerView() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pb-20 bg-zinc-950 relative overflow-hidden">
            {/* Background Gradients/Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
            <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none opacity-30" />

            {/* Hero Section */}
            <section className="relative pt-20 pb-16">
                <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">

                    <div
                        
                        
                        
                    >
                        <Badge className="mb-6 bg-zinc-900/50 text-zinc-300 border-zinc-800 backdrop-blur-md px-4 py-1.5 hover:bg-zinc-800/50 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            Live for all retailers in India
                        </Badge>
                    </div>

                    <h1
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white"
                        
                        
                        
                    >
                        Trade Smarter. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
                            Grow Faster.
                        </span>
                    </h1>

                    <p
                        className="text-zinc-400 max-w-2xl text-lg md:text-xl mb-10 leading-relaxed"
                        
                        
                        
                    >
                        Welcome back, <span className="text-white font-semibold">{user?.business_name || 'Vicky Collection'}</span>.
                        The first AI-powered B2B platform that handles sourcing, trust, and logistics. Zero fraud. Zero guesswork.
                    </p>

                    <div
                        className="flex flex-col sm:flex-row gap-4"
                        
                        
                        
                    >
                        <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base font-medium shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all">
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Product
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 border-zinc-700 bg-transparent text-white hover:bg-white/5 rounded-full text-base font-medium">
                            View Marketplace
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <div className="container mx-auto px-6 mb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Revenue"
                        value="₹12.5L"
                        trend="+12%"
                        icon={DollarSign}
                        delay={0.4}
                    />
                    <StatsCard
                        title="Active Orders"
                        value="24"
                        trend="8 Pending"
                        icon={Package}
                        delay={0.5}
                    />
                    <StatsCard
                        title="Trust Score"
                        value={user?.trust_score?.toString() || "568"}
                        trend="Top 5%"
                        icon={TrendingUp}
                        delay={0.6}
                    />
                    <StatsCard
                        title="Retailer Connections"
                        value="156"
                        trend="+3 this week"
                        icon={Users}
                        delay={0.7}
                    />
                </div>
            </div>

            {/* Inventory Section */}
            <div className="container mx-auto px-6 pb-12 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <Package className="w-6 h-6 text-purple-400" />
                        Inventory Management
                    </h2>
                    <div className="flex gap-3">
                        <div className="relative w-72">
                            <Search className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 h-11 bg-zinc-900/40 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-purple-500/20 focus-visible:border-purple-500/50 backdrop-blur-sm"
                            />
                        </div>
                        <Button variant="outline" className="h-11 border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white backdrop-blur-sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-zinc-800">
                                <TableHead className="text-zinc-500 font-medium h-12 pl-6">Product Name</TableHead>
                                <TableHead className="text-zinc-500 font-medium">Category</TableHead>
                                <TableHead className="text-zinc-500 font-medium">Stock</TableHead>
                                <TableHead className="text-zinc-500 font-medium">Price (B2B)</TableHead>
                                <TableHead className="text-zinc-500 font-medium">Status</TableHead>
                                <TableHead className="text-zinc-500 font-medium text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((item) => (
                                <TableRow key={item} className="hover:bg-purple-500/5 border-zinc-800/50 group transition-colors">
                                    <TableCell className="font-medium py-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700/50" />
                                            <div>
                                                <div className="text-zinc-200 font-medium">Premium Cotton Shirt</div>
                                                <div className="text-xs text-zinc-500 mt-1">SKU: SH-00{item}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">Apparel</TableCell>
                                    <TableCell>
                                        <span className="text-emerald-400 font-medium">1,200 units</span>
                                    </TableCell>
                                    <TableCell className="text-zinc-200 font-medium">₹450/pc</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">Active</Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-700">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, trend, icon: Icon, delay }: any) {
    return (
        <div
            
            
            
        >
            <Card className="bg-zinc-900/40 border-zinc-800/60 hover:border-purple-500/30 transition-all duration-300 group h-32 flex flex-col justify-between backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-0">
                    <CardTitle className="text-sm font-medium text-zinc-500 group-hover:text-purple-400 transition-colors">
                        {title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-zinc-600 group-hover:text-purple-500 transition-colors" />
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <div className="text-2xl font-bold text-white mb-1">{value}</div>
                    <p className="text-xs text-zinc-500 font-medium">{trend}</p>
                </CardContent>
            </Card>
        </div>
    );
}
