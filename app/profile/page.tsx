'use client';

import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthGuard } from '@/components/auth/auth-guard';
import { authFetch } from '@/lib/auth-fetch';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(user || null);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await authFetch('/api/profile', { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.user) {
          setProfile({ ...payload.user, role: user.role });
        }
      }
      await refreshUser();
    } catch (error) {
      console.warn('Background profile fetch:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setProfile((prev: any) => (prev ? { ...prev, ...user } : user));
      fetchProfile();
    }
  }, [user?.id]);

  const currentProfile = profile || user;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 pb-20 transition-colors">
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
        <ProfileHeader profile={currentProfile} onUpdate={fetchProfile} />
        <Suspense
          fallback={
            <div className="h-64 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 animate-pulse" />
          }
        >
          <ProfileTabs profile={currentProfile} onUpdate={fetchProfile} />
        </Suspense>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
