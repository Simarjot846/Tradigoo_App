'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, Clock, CheckCircle, Loader2, Package } from 'lucide-react';

export default function DisputeClient() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDispute() {
            const id = Array.isArray(params.id) ? params.id[0] : params.id;
            if (!id || id === 'placeholder') {
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();
                const { data, error: fetchError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        product:products!product_id (name, description),
                        seller:profiles!seller_id (business_name),
                        buyer:profiles!buyer_id (business_name)
                    `)
                    .eq('id', id)
                    .single();

                if (fetchError || !data) {
                    setError('Dispute not found or access denied.');
                } else {
                    setOrder(data);
                }
            } catch (err: any) {
                setError(err?.message || 'Failed to load dispute details.');
            } finally {
                setLoading(false);
            }
        }

        fetchDispute();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <span className="ml-3 text-zinc-400">Loading dispute details...</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Dispute Not Found</h1>
                <p className="text-zinc-500 mb-6">{error || 'This dispute does not exist.'}</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }

    const isResolved = order.status === 'completed';

    return (
        <div className="min-h-screen bg-zinc-950 text-white py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Dispute Status</h1>
                        <p className="text-zinc-500 text-sm">Order #{order.id.slice(0, 8)}</p>
                    </div>
                    <Badge className={`ml-auto ${isResolved ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {isResolved ? 'Resolved' : 'Under Review'}
                    </Badge>
                </div>

                {/* Status Card */}
                <Card className="bg-zinc-900 border-zinc-800 p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${isResolved ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                            {isResolved
                                ? <CheckCircle className="w-6 h-6 text-green-400" />
                                : <Clock className="w-6 h-6 text-red-400" />
                            }
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">
                                {isResolved ? 'Dispute Resolved' : 'Dispute Under Review'}
                            </h2>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                {isResolved
                                    ? 'This dispute has been resolved. Thank you for your patience.'
                                    : 'Our team is reviewing the evidence submitted. Resolution expected within 48 hours.'}
                            </p>
                        </div>
                    </div>

                    {/* Dispute Reason */}
                    {order.dispute_reason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                            <p className="text-xs text-red-400 uppercase font-bold mb-1">Reported Issue</p>
                            <p className="text-zinc-300 text-sm">{order.dispute_reason}</p>
                        </div>
                    )}

                    {/* Order Info */}
                    <div className="space-y-3 border-t border-zinc-800 pt-4">
                        <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-zinc-500" />
                            <span className="text-zinc-400 text-sm">Product:</span>
                            <span className="text-white text-sm font-medium">{order.product?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Buyer</span>
                            <span className="text-zinc-300">{order.buyer?.business_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Seller</span>
                            <span className="text-zinc-300">{order.seller?.business_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Order Value</span>
                            <span className="text-white font-medium">₹{order.total_amount?.toLocaleString()}</span>
                        </div>
                    </div>
                </Card>

                {/* Evidence */}
                {order.dispute_evidence && order.dispute_evidence.length > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800 p-6">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase mb-4">Submitted Evidence</h3>
                        <div className="space-y-2">
                            {order.dispute_evidence.map((url: string, i: number) => (
                                <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm underline"
                                >
                                    Evidence {i + 1}
                                </a>
                            ))}
                        </div>
                    </Card>
                )}

                <Button
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-400"
                    onClick={() => router.push(`/order/${order.id}`)}
                >
                    View Full Order Details
                </Button>
            </div>
        </div>
    );
}
