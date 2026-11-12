'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <ForgotPasswordContent />
        </Suspense>
    );
}

function ForgotPasswordContent() {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout heroContent={
            <>
                <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    Secure your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Account</span> access.
                </h1>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                    We prioritize your security. Resetting your password helps you maintain control over your Tradigoo profile.
                </p>
            </>
        }>
            <div className="mb-8 text-center lg:text-left">
                <Link href="/auth/login" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
                    ← Back to login
                </Link>
                <div
                    
                    
                    
                >
                    <div className="mb-6 flex justify-center lg:justify-start">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-zinc-200/80 inline-flex items-center">
                            <Image
                                src="/tradigoo-full-logo.png"
                                alt="Tradigoo"
                                width={150}
                                height={50}
                                className="h-8 w-auto object-contain"
                                priority
                            />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Forgot Password?</h1>
                    <p className="text-zinc-500">Enter your email and we'll send you a reset link.</p>
                </div>
            </div>

            <div
                
                
                
            >
                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Check your email</h3>
                        <p className="text-green-700 text-sm mb-6">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                            <Link href="/auth/login">Back to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-700">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-500/20"
                            disabled={loading}
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </Button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
