'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Calendar, Tag, ShieldCheck, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyOrderClient() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrderData() {
            const rawOrderId = params.orderId;
            const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
            if (!orderId || orderId === 'placeholder') {
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();
                const { data: orderData, error: orderError } = await supabase
                    .from("orders")
                    .select(`
                        *,
                        product:products!product_id (
                            name,
                            description,
                            batch_number,
                            expiry_date,
                            expected_margin
                        ),
                        seller:profiles!seller_id (
                            business_name,
                            gst_verified
                        )
                    `)
                    .eq("id", orderId)
                    .single();

                if (orderError || !orderData) {
                    setError("Order not found or access denied.");
                } else {
                    setOrder(orderData);
                }
            } catch (err: any) {
                setError(err?.message || "Failed to load order verification details.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrderData();
    }, [params.orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-400">Verifying order authenticity...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Order Not Found</h1>
                <p className="text-zinc-500 max-w-md">
                    {error || "The QR code you scanned is invalid or the order does not exist in our records."}
                </p>
            </div>
        );
    }

    const { product, seller } = order;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-12 px-4 selection:bg-blue-500/30">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg space-y-8">
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-6 py-2 rounded-full flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-8">
                        <CheckCircle className="w-5 h-5 fill-emerald-500/20" />
                        <span className="font-bold tracking-wide uppercase text-sm">Official Tradigoo Verification</span>
                    </div>
                </div>

                <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <div className="bg-white/5 px-6 py-4 flex justify-between items-center border-b border-white/5">
                        <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">Order ID</span>
                        <span className="text-white font-mono font-bold tracking-widest text-sm">#{order.id.slice(0, 8)}</span>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2 leading-tight">{product?.name || "Unknown Product"}</h1>
                            <p className="text-zinc-400 text-sm leading-relaxed">{product?.description || "No description available."}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <DetailBox label="Quantity" value={`${order.quantity} Units`} icon={Package} />
                            <DetailBox label="Total Value" value={`₹${order.total_amount?.toLocaleString()}`} icon={Tag} highlight />
                            <DetailBox label="Batch No." value={product?.batch_number || "BATCH-001"} icon={ShieldCheck} />
                            <DetailBox label="Expiry" value={product?.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"} icon={Calendar} />
                        </div>

                        <div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Supplier</p>
                                <p className="text-white font-medium">{seller?.business_name || "Verified Supplier"}</p>
                            </div>
                            {seller?.gst_verified && (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1">
                                    <ShieldCheck className="w-3 h-3" /> GST Verified
                                </Badge>
                            )}
                        </div>

                        <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 p-5 text-center">
                            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-1">Retailer Margin</p>
                            <p className="text-3xl font-bold text-white tracking-tight">{product?.expected_margin || "15"}%</p>
                        </div>
                    </div>

                    <div className="p-6 pt-0">
                        <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold" onClick={() => globalThis.print()}>
                            <Printer className="w-4 h-4 mr-2" /> Print Verification Record
                        </Button>
                    </div>
                </Card>

                <div className="text-center">
                    <p className="text-zinc-600 text-xs">
                        Verified by Tradigoo Secure Chain • {new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DetailBox({ label, value, icon: Icon, highlight }: { label: string, value: string, icon: any, highlight?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border ${highlight ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
            <div className="flex items-center gap-2 mb-2 text-zinc-400">
                <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-400' : ''}`} />
                <span className={`text-xs uppercase font-bold ${highlight ? 'text-emerald-400' : ''}`}>{label}</span>
            </div>
            <div className={`text-lg font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}
