'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { processOAuthCallback } from '@/lib/oauth-handler';
import { useAuth } from '@/lib/auth-context';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [statusMsg, setStatusMsg] = useState('Verifying authentication...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const result = await processOAuthCallback(searchParams);

        if (!mounted) return;

        if (result.success) {
          setStatusMsg('Login successful! Redirecting...');
          await refreshUser();
          if (!mounted) return;

          // If opened in in-app browser overlay on Android, hand over to native app with tokens
          if (typeof window !== 'undefined' && /android/i.test(navigator.userAgent)) {
            try {
              const { createClient } = await import('@/lib/supabase-client');
              const supabase = createClient();
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.access_token && session?.refresh_token) {
                window.location.href = `com.tradigoo.app://auth/callback#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
                return;
              } else {
                window.location.href = 'com.tradigoo.app://auth/callback';
              }
            } catch {}
          }

          const next = searchParams.get('next') || '/dashboard';
          router.replace(next);
        } else {
          // Retry check after 800ms to allow storage warm-up
          await new Promise(r => setTimeout(r, 800));
          const retryResult = await processOAuthCallback(searchParams);
          if (mounted) {
            if (retryResult.success) {
              await refreshUser();
              const next = searchParams.get('next') || '/dashboard';
              router.replace(next);
            } else {
              setErrorMessage('Authentication could not be completed. Please try signing in again.');
            }
          }
        }
      } catch (err: any) {
        if (mounted) {
          console.error('[OAuth Callback] Error:', err);
          setErrorMessage(err?.message || 'Authentication failed. Please try again.');
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [searchParams, router, refreshUser]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950 p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Sign In Problem</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">{errorMessage}</p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{statusMsg}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-3 p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-zinc-500 font-medium">Loading authentication...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
