"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
// import CryptoJS from "crypto-js"; // Dynamically imported
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, ShieldCheck, Box, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const dataParam = searchParams.get('data');
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [data, setData] = useState<any>(null);
    const [debugError, setDebugError] = useState<string>('');

    useEffect(() => {
        let isMounted = true;

        async function verify() {
            if (!dataParam) {
                setStatus('invalid');
                setDebugError("Missing 'data' parameter in URL");
                return;
            }

            try {
                // Dynamic import to reduce  bundle size
                // and ensure UI renders loading state before heavy work starts
                const CryptoJS = (await import("crypto-js")).default;

                // Slight delay to allow UI to paint
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!isMounted) return;

                // 1. Sanitize Input: Replace spaces with '+' (common URL encoding glitch)
                // CRITICAL FIX: Base64 strings in URLs often have '+' replaced by space if not encoded perfectly
                const cleanCipher = dataParam.replace(/ /g, '+');

                // 2. Decrypt
                const secretKey = "TRADIGOO_SECRET_KEY_PROD";
                // Check for potential encoding issues
                if (!cleanCipher) throw new Error("Empty data parameter");

                const bytes = CryptoJS.AES.decrypt(cleanCipher, secretKey);

                // 3. Convert to String
                let decryptedString = '';
                try {
                    decryptedString = bytes.toString(CryptoJS.enc.Utf8);
                } catch (utfErr) {
                    // If AES decrypt fails it often returns empty string, but sometimes throws
                    throw new Error("Decryption Failed: Malformed data or wrong key");
                }

                if (!decryptedString) {
                    // Determine if it was a wrong key or just emptiness
                    // Usually an empty string here means the key didn't work for this cipher
                    throw new Error("Decryption Result Empty. Please check if the QR was generated with the same Secret Key.");
                }

                // 4. Parse JSON
                let parsedData;
                try {
                    parsedData = JSON.parse(decryptedString);
                } catch (jsonErr) {
                    throw new Error("Invalid JSON structure in decrypted data");
                }

                if (isMounted) {
                    setData(parsedData);
                    setStatus('valid');
                }

            } catch (e: any) {
                console.error("Verification Critical Failure:", e);
                if (isMounted) {
                    setDebugError(e.message || "Unknown error during verification.");
                    setStatus('invalid');
                }
            }
        }

        verify();

        return () => { isMounted = false; };
    }, [dataParam]);

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full" />
                    <ShieldCheck className="w-16 h-16 text-blue-500 animate-pulse relative z-10" />
                </div>
                <p className="text-zinc-400 font-medium tracking-wide animate-pulse">Authenticating Secure Token...</p>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <Card className="bg-zinc-900 border-red-500/50 p-8 text-center max-w-md w-full mx-4">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Invalid Code</h1>
                <p className="text-zinc-400 mb-6">This QR code could not be verified.</p>

                <div className="bg-red-950/50 border border-red-500/20 text-red-200 text-xs p-4 rounded-lg text-left overflow-auto max-h-40">
                    <p className="font-bold mb-1">Debug Info:</p>
                    <p className="font-mono mb-2">{debugError}</p>
                    <p className="font-bold mb-1 opacity-50">Received Data (First 30 chars):</p>
                    <p className="font-mono opacity-50 break-all">{dataParam?.slice(0, 30)}...</p>
                </div>

                <div className="mt-6">
                    <Link href="/" className="text-zinc-500 hover:text-white text-sm underline">
                        Return to Home
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-900 border-emerald-500 p-0 overflow-hidden max-w-md w-full relative mx-4 animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500" />

            <div className="p-8 text-center bg-gradient-to-b from-emerald-900/20 to-zinc-900">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">Authentic</h1>
                <p className="text-emerald-400 font-medium">Verified by Tradigoo Secure</p>
            </div>

            <div className="p-6 space-y-4">
                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-zinc-800 p-2 rounded text-zinc-400">
                            <Box className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-white font-semibold text-lg">{data.p}</h3>
                            <p className="text-zinc-400">{data.q} Units</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-zinc-800/50 p-3 rounded-lg text-center">
                        <div className="text-zinc-500 text-xs uppercase font-bold">Order ID</div>
                        <div className="text-white font-mono">#{data.id?.slice(0, 6)}</div>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg text-center">
                        <div className="text-zinc-500 text-xs uppercase font-bold">Timestamp</div>
                        <div className="text-white">{new Date(data.t).toLocaleDateString()}</div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-center text-zinc-500">
                        Batch ID: {data.salt?.slice(0, 8).toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="bg-emerald-900/10 p-4 border-t border-emerald-500/10 text-center">
                <Link href="/" className="text-emerald-400 text-sm hover:underline font-medium">
                    Verified on Tradigoo Blockchain
                </Link>
            </div>
        </Card>
    );
}

export default function VerifyQRPage() {
    return (
        <div className="min-h-[100dvh] bg-blue-950 flex flex-col items-center justify-center p-4 relative">
            {/* Safe Header to prove page checks out */}
            <div className="absolute top-6 left-0 w-full text-center pointer-events-none z-50">
                <p className="text-white text-lg font-bold uppercase tracking-widest drop-shadow-md">Tradigoo Verification</p>
            </div>

            <Suspense fallback={<div className="text-white flex items-center gap-2"><Loader2 className="animate-spin" /> Loading System...</div>}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
