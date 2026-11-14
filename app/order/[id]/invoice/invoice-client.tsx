'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { authFetch } from '@/lib/auth-fetch';
import { useAuth } from '@/lib/auth-context';

export default function InvoiceClient() {
    const params = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [buyer, setBuyer] = useState<any>(null);
    const [seller, setSeller] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            if (isMounted) {
                console.warn("[Invoice] Fetch timed out (10s)");
                setLoading(false);
            }
        }, 10000);

        async function fetchInvoiceData() {
            if (authLoading) return;

            const rawId = params.id;
            const id = Array.isArray(rawId) ? rawId[0] : rawId;
            if (!id || id === 'placeholder') {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                if (!user) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const res = await authFetch(`/api/orders/${encodeURIComponent(id)}`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });
                const orderData = await res.json();

                if (controller.signal.aborted) return;

                if (!res.ok || !orderData || orderData.error) {
                    console.error("Error fetching invoice order:", orderData?.error || res.status);
                    if (isMounted) setLoading(false);
                    return;
                }

                if (isMounted) {
                    setOrder({
                        ...orderData,
                        product_name: orderData.product?.name || 'Product',
                        unit: orderData.product?.unit
                    });
                    setBuyer(orderData.buyer || null);
                    setSeller(orderData.seller || null);
                    setLoading(false);
                }

            } catch (err: any) {
                if (err.name === 'AbortError' || controller.signal.aborted) return;
                console.error("Invoice Data Fetch Error:", err);
                if (isMounted) setLoading(false);
            }
        }

        fetchInvoiceData();

        return () => {
            isMounted = false;
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [params.id, user, authLoading]);

    if (loading) return <div className="p-10 text-center">Loading Invoice Data...</div>;

    if (!user && !loading) {
        return (
            <div className="p-10 text-center space-y-4">
                <p className="text-red-500 font-bold">Authentication Failed.</p>
                <p className="text-zinc-500">Could not verify your identity. Please make sure you are logged in.</p>
                <Button onClick={() => router.push('/auth/login')}>Sign In to Retry</Button>
            </div>
        );
    }

    if (!order) return <div className="p-10 text-center text-red-500">Invoice Information Not Available</div>;

    const displayBuyer = buyer || { name: 'Verified Buyer', business_name: 'Retail Partner', location: '' };
    const displaySeller = seller || { name: 'Verified Supplier', business_name: 'Wholesaler', location: '' };

    const subtotal = Number(order.subtotal || ((Number(order.unit_price || 0) * Number(order.quantity || 1)) || order.total_amount || 0));
    const taxAmount = Number(order.tax_amount ?? Math.max(0, Number(order.total_amount || 0) - subtotal));
    const grandTotal = Number(order.total_amount || subtotal + taxAmount);

    const handlePrint = () => {
        window.print();
    };

    const handleClose = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(order?.id ? `/order/${order.id}` : '/my-orders');
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Button variant="outline" onClick={handleClose} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Order
                </Button>
                <div className="flex gap-2">
                    <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="w-4 h-4" /> Print Invoice
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-white border border-zinc-200 shadow-lg p-8 md:p-16 print:shadow-none print:border-0 print:p-0">
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="mb-2">
                            <Image
                                src="/tradigoo-full-logo.png"
                                alt="Tradigoo"
                                width={160}
                                height={52}
                                className="h-9 w-auto object-contain"
                                priority
                            />
                        </div>
                        <p className="text-xs text-zinc-500 font-medium tracking-wide">Direct Factory-to-Retail OS • Escrow Protected</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-light text-zinc-300 uppercase tracking-widest mb-2">Invoice</h2>
                        <p className="font-mono text-zinc-600">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                <div className="flex justify-between border-b border-zinc-100 pb-8 mb-8">
                    <div className="space-y-1">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Date Issued</p>
                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Payment Status</p>
                        <p className="font-medium text-green-600">PAID (Escrow)</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4">Billed To</p>
                        <h3 className="font-bold text-lg">{displayBuyer.business_name || displayBuyer.name}</h3>
                        <p className="text-zinc-600">{displayBuyer.name}</p>
                        <p className="text-zinc-500 text-sm whitespace-pre-line">{displayBuyer.location}</p>
                    </div>
                    <div className="md:text-right">
                        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-4">Shipped From</p>
                        <h3 className="font-bold text-lg">{displaySeller.business_name || displaySeller.name}</h3>
                        <p className="text-zinc-600">{displaySeller.name}</p>
                        <p className="text-zinc-500 text-sm whitespace-pre-line">{displaySeller.location}</p>
                        <p className="text-zinc-500 text-sm mt-2">
                            GSTIN: {displaySeller.gst_number || (displaySeller.gst_verified ? 'Verified' : 'Unregistered')}
                        </p>
                    </div>
                </div>

                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-zinc-100">
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400">Item Description</th>
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400 text-right">Qty</th>
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400 text-right">Rate</th>
                                <th className="py-4 text-xs uppercase tracking-wider font-semibold text-zinc-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-zinc-700">
                            <tr className="border-b border-zinc-50">
                                <td className="py-4 font-medium">{order.product_name}</td>
                                <td className="py-4 text-right">{order.quantity} {order.unit}</td>
                                <td className="py-4 text-right">₹{order.unit_price?.toLocaleString()}</td>
                                <td className="py-4 text-right font-medium">₹{order.total_amount?.toLocaleString()}</td>
                            </tr>
                            <tr className="h-24"><td colSpan={4}></td></tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mb-12">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-zinc-600">
                            <span>Subtotal</span>
                            <span>₹{subtotal?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600">
                            <span>GST (5%)</span>
                            <span>₹{taxAmount?.toLocaleString()}</span>
                        </div>
                        <div className="border-t-2 border-zinc-100 pt-3 flex justify-between text-xl font-bold text-zinc-900">
                            <span>Total</span>
                            <span>₹{grandTotal?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-sm text-zinc-400 pt-12 border-t border-zinc-100 print:bottom-8 print:absolute print:w-full print:left-0 print:border-none">
                    <p className="mb-2">Thank you for your business!</p>
                    <p>Tradigoo Inc. • 123 Market Street, Pune, India • support@tradigoo.com</p>
                </div>
            </div>
        </div>
    );
}
