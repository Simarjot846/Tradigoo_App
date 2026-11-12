'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Smartphone, ExternalLink, X } from 'lucide-react';

export function NativeAppHandoff() {
  const { user } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Do not show if already inside the native Capacitor app WebView
    const isNative = !!((window as any).Capacitor?.isNativePlatform?.());
    if (isNative) return;

    // Only show on Android devices where the native app may be running alongside
    const isAndroid = /android/i.test(navigator.userAgent);
    if (!isAndroid) return;

    if (user) {
      setShouldShow(true);

      // Attempt automatic handoff with session tokens once after login
      const hasAttempted = sessionStorage.getItem('tradigoo_auto_handoff_tried');
      if (!hasAttempted) {
        sessionStorage.setItem('tradigoo_auto_handoff_tried', 'true');
        const timer = setTimeout(async () => {
          try {
            const { createClient } = await import('@/lib/supabase-client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token && session?.refresh_token) {
              window.location.href = `com.tradigoo.app://auth/callback#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
              return;
            }
          } catch {}
          try {
            window.location.href = 'com.tradigoo.app://dashboard';
          } catch {}
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  if (!shouldShow || dismissed || !user) return null;

  const handleOpenApp = async () => {
    try {
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.refresh_token) {
        window.location.href = `com.tradigoo.app://auth/callback#access_token=${encodeURIComponent(session.access_token)}&refresh_token=${encodeURIComponent(session.refresh_token)}`;
        return;
      }
    } catch {}

    try {
      window.location.href = 'com.tradigoo.app://dashboard';
    } catch {
      window.location.href = 'tradigoo://dashboard';
    }
  };

  return (
    <div className="sticky top-0 z-[60] w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-3 py-2.5 shadow-md flex items-center justify-between gap-2 text-xs sm:text-sm animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Smartphone className="w-4 h-4 shrink-0 text-blue-200" />
        <span className="truncate font-medium">
          Logged in as <strong className="text-white">{user.name || user.email}</strong>!
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={handleOpenApp}
          className="h-7 text-xs bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-lg px-2.5 shadow-sm transition-transform active:scale-95"
        >
          Open in App
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-white/80 hover:text-white rounded-md transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
