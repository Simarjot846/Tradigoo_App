'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from './supabase';
import { resolveEffectiveRole } from './roles';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCachedProfile(userId: string): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`tradigoo_cached_profile_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id === userId && parsed.role) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

function setCachedProfile(profile: User): void {
  if (typeof window === 'undefined' || !profile?.id) return;
  try {
    localStorage.setItem(`tradigoo_cached_profile_${profile.id}`, JSON.stringify(profile));
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const buildFallbackProfile = useCallback((authUser: SupabaseUser): User => {
    const cached = getCachedProfile(authUser.id);
    const email = (authUser.email || cached?.email || 'user@tradigoo.com').toLowerCase();
    if (cached) {
      return {
        ...cached,
        id: authUser.id,
        email,
        role: resolveEffectiveRole(email, cached.role),
      };
    }

    const metaRole = (authUser.user_metadata?.role || authUser.app_metadata?.role) as string | undefined;
    const effectiveRole = resolveEffectiveRole(email, metaRole || 'retailer');

    return {
      id: authUser.id,
      email,
      name: authUser.user_metadata?.name || email.split('@')[0] || 'Trader',
      phone: authUser.phone || authUser.user_metadata?.phone || null,
      role: effectiveRole,
      business_name: authUser.user_metadata?.business_name || '',
      location: authUser.user_metadata?.location || 'India',
      trust_score: 500,
      total_orders: 0,
      successful_orders: 0,
      disputed_orders: 0,
      gst_verified: false,
      is_low_trust: false,
      created_at: authUser.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, []);

  const fetchUserProfile = useCallback(async (authUser: SupabaseUser): Promise<User> => {
    const fallback = buildFallbackProfile(authUser);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile query timeout')), 10000)
      );
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: profile } = (await Promise.race([queryPromise, timeoutPromise])) as any;

      if (!profile) {
        let assignedRole: UserRole = fallback.role;
        try {
          if (typeof window !== 'undefined' && assignedRole !== 'founder' && assignedRole !== 'employee') {
            const pendingRole = localStorage.getItem('tradigoo_pending_oauth_role');
            if (pendingRole === 'wholesaler' || pendingRole === 'retailer') {
              assignedRole = pendingRole;
              localStorage.removeItem('tradigoo_pending_oauth_role');
            }
          }
        } catch {}

        const newProfile: User = { ...fallback, role: assignedRole };
        supabase.from('profiles').insert(newProfile as any).then(() => {}, () => {});
        setCachedProfile(newProfile);
        return newProfile;
      }

      const email = (authUser.email || profile.email || fallback.email).toLowerCase();
      const effectiveRole = resolveEffectiveRole(email, profile.role);

      const fullProfile: User = {
        ...fallback,
        ...profile,
        id: authUser.id,
        email,
        role: effectiveRole,
      };

      setCachedProfile(fullProfile);
      return fullProfile;
    } catch (err) {
      console.warn('[AuthContext] Profile fetch notice, preserving fallback profile:', err);
      return fallback;
    }
  }, [supabase, buildFallbackProfile]);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const p = await fetchUserProfile(authUser);
        setUser(p);
      } else {
        setUser(null);
      }
    } catch {}
  }, [supabase, fetchUserProfile]);

  useEffect(() => {
    let mounted = true;

    const applyUserSession = async (authUser: SupabaseUser | null) => {
      if (!mounted) return;

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser((prev) => {
        if (prev && prev.id === authUser.id && prev.role) {
          return {
            ...prev,
            role: resolveEffectiveRole(authUser.email || prev.email, prev.role),
          };
        }
        return buildFallbackProfile(authUser);
      });
      setLoading(false);

      try {
        const fullProfile = await fetchUserProfile(authUser);
        if (mounted) {
          setUser(fullProfile);
        }
      } catch (err) {
        console.warn('Background profile fetch:', err);
      }
    };

    const initAuth = async () => {
      const safetyTimer = setTimeout(() => {
        if (mounted) setLoading(false);
      }, 3500);

      try {
        try {
          const { warmUpCapacitorStorage } = await import('@/lib/supabase-client');
          await warmUpCapacitorStorage();
        } catch {}

        if (!mounted) return;

        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          await applyUserSession(session.user);
          return;
        }

        if (!error) {
          const { data: { user: authUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
          if (mounted) {
            await applyUserSession(authUser || null);
          }
        } else {
          await applyUserSession(null);
        }
      } catch {
        if (mounted) await applyUserSession(null);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (session.user) {
        if (event === 'TOKEN_REFRESHED' && user?.id === session.user.id) {
          return;
        }
        await applyUserSession(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, buildFallbackProfile, fetchUserProfile]);

  const signIn = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        try {
          const res = await fetch('/api/auth/signin', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const payload = await res.json();
          if (res.ok && payload.user) {
            const instantProfile = buildFallbackProfile(payload.user);
            setUser(instantProfile);
            setLoading(false);
            fetchUserProfile(payload.user).then((p) => setUser(p)).catch(() => {});
            return instantProfile;
          }
        } catch {}
        throw error;
      }

      if (data.user) {
        const instantProfile = buildFallbackProfile(data.user);
        setUser(instantProfile);
        setLoading(false);
        fetchUserProfile(data.user).then((p) => setUser(p)).catch(() => {});
        return instantProfile;
      }

      setLoading(false);
      return null;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signInWithGoogle = async (role?: UserRole) => {
    try {
      if (typeof window !== 'undefined' && (role === 'retailer' || role === 'wholesaler')) {
        try {
          localStorage.setItem('tradigoo_pending_oauth_role', role);
        } catch {}
      }

      const { Capacitor } = await import('@capacitor/core');
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        const { Browser } = await import('@capacitor/browser');
        const redirectTo = 'com.tradigoo.app://auth/callback';
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
            queryParams: { access_type: 'offline', prompt: 'consent' },
          },
        });
        if (error) throw error;
        if (data?.url) {
          await Browser.open({ url: data.url, windowName: '_self' });
        }
      } else {
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error('Sign in with Google error:', err);
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const safeRole: 'retailer' | 'wholesaler' = userData.role === 'wholesaler' ? 'wholesaler' : 'retailer';

    try {
      try {
        const checkRes = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const checkData = await checkRes.json();
        if (checkData.exists) {
          setLoading(false);
          throw new Error('This email is already registered. Please log in instead.');
        }
      } catch (checkErr: any) {
        if (checkErr.message?.includes('already registered')) {
          setLoading(false);
          throw checkErr;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: safeRole,
            business_name: userData.business_name || '',
            phone: userData.phone || null,
            location: userData.location || 'India',
          },
        },
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('user already exists') || msg.includes('email already')) {
          setLoading(false);
          throw new Error('This email is already registered. Please log in instead.');
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, password, userData: { ...userData, role: safeRole } }),
        });
        const respData = await response.json();
        if (!response.ok) {
          throw new Error(respData.error || error.message || 'Failed to sign up');
        }
        if (respData.user) {
          const instantProfile = buildFallbackProfile(respData.user);
          setUser(instantProfile);
          setLoading(false);
          fetchUserProfile(respData.user).then((p) => setUser(p)).catch(() => {});
        }
        setLoading(false);
        return;
      }

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setLoading(false);
        throw new Error('This email is already registered. Please log in instead.');
      }

      if (data.user) {
        const assignedRole = resolveEffectiveRole(cleanEmail, safeRole);
        const newProfile: User = {
          id: data.user.id,
          email: cleanEmail,
          name: userData.name || cleanEmail.split('@')[0],
          role: assignedRole,
          business_name: userData.business_name || '',
          phone: userData.phone || null,
          location: userData.location || 'India',
          trust_score: 500,
          total_orders: 0,
          successful_orders: 0,
          disputed_orders: 0,
          gst_verified: false,
          is_low_trust: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from('profiles').insert(newProfile as any);
        setUser(newProfile);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut().catch(() => {});
      await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' }).catch(() => {});

      try {
        if (typeof window !== 'undefined') {
          for (let i = window.localStorage.length - 1; i >= 0; i--) {
            const key = window.localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.startsWith('supabase') || key.startsWith('tradigoo_'))) {
              window.localStorage.removeItem(key);
            }
          }

          const { Capacitor } = await import('@capacitor/core');
          if (Capacitor.isNativePlatform()) {
            const { Preferences } = await import('@capacitor/preferences');
            const { keys } = await Preferences.keys();
            await Promise.all(
              keys
                .filter((k) => k.startsWith('sb-') || k.startsWith('supabase') || k.startsWith('tradigoo_'))
                .map((k) => Preferences.remove({ key: k }))
            );
          }
        }
      } catch {}
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/');
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const updateRole = async (newRole: UserRole) => {
    if (!user) return;
    // Prevent privilege escalation or switching founder/employee accounts
    if (user.role === 'founder' || user.role === 'employee') {
      throw new Error('Privileged staff and founder roles cannot be switched from profile settings.');
    }
    if (newRole !== 'retailer' && newRole !== 'wholesaler') {
      throw new Error('Only Retailer or Wholesaler business roles can be selected.');
    }
    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);

      if (dbError) throw dbError;

      await supabase.auth.updateUser({ data: { role: newRole } }).catch(() => {});

      const updatedUser: User = { ...user, role: newRole };
      setCachedProfile(updatedUser);
      setUser(updatedUser);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      refreshUser,
      updateRole,
      resetPassword,
      updatePassword,
    }),
    [user, loading, buildFallbackProfile, fetchUserProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
