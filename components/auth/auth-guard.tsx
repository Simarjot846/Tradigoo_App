'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import type { UserRole } from '@/lib/supabase';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<UserRole | 'admin'>;
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSessionBeforeRedirect = async () => {
      if (!loading && !user) {
        const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();
        const graceMs = isNative ? 1200 : 500;

        try {
          const { createClient } = await import('@/lib/supabase-client');
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            await refreshUser();
            return;
          }
        } catch {}

        const timer = setTimeout(async () => {
          if (!mounted) return;
          try {
            const { createClient } = await import('@/lib/supabase-client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              await refreshUser();
              return;
            }
          } catch {}

          if (mounted && !user) {
            setRedirecting(true);
            const redirectPath = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
            router.replace(redirectPath);
          }
        }, graceMs);

        return () => clearTimeout(timer);
      }
    };

    checkSessionBeforeRedirect();

    return () => {
      mounted = false;
    };
  }, [user, loading, router, pathname, refreshUser]);

  if (loading || (!user && !redirecting)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user && redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">Redirecting to login...</p>
          <a
            href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
          >
            Click here if not redirected automatically
          </a>
        </div>
      </div>
    );
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 rounded-2xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-slate-500 dark:text-zinc-400 text-sm mb-6">
            Your account ({user.role}) does not have permission to open this workspace.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
