'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthErrorPage() {
    return (
        <AuthLayout
            heroContent={
                <div className="max-w-lg">
                    <h1 className="text-5xl font-bold text-white mb-6">
                        Something went <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">Wrong</span>.
                    </h1>
                    <p className="text-zinc-400 text-lg mb-8">
                        We encountered an error while trying to authenticate you. Please try again.
                    </p>
                </div>
            }
        >
            <div
                
                
                className="text-center"
            >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Authentication Error</h2>
                <p className="text-zinc-600 mb-8">
                    There was a problem signing you in. The link may have expired or is invalid.
                </p>
                <Button asChild className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-11">
                    <Link href="/auth/login">
                        Back to Login
                    </Link>
                </Button>
            </div>
        </AuthLayout>
    );
}
