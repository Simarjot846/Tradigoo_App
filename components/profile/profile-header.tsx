'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, ShieldCheck, TrendingUp, Building2, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { authFetch, refreshAccessToken } from '@/lib/auth-fetch';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileHeaderProps {
    profile: any;
    onUpdate: () => void;
}

export function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
    const { user, updateRole } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [switchingRole, setSwitchingRole] = useState(false);
    const [showBucketError, setShowBucketError] = useState(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const supabase = createClient();
            await refreshAccessToken(false);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 2. Update profile via authenticated API route
            const res = await authFetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profile_image_url: publicUrl }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.error || 'Failed to update profile image');
            }

            toast.success('Profile photo updated!');
            onUpdate();

        } catch (error: any) {
            console.error('Error uploading avatar:', error);

            // robustness check: verify if bucket exists
            const supabase = createClient(); // Re-initialize supabase client if not already in scope
            const { error: bucketCheckError } = await supabase.storage.getBucket('avatars');

            if (bucketCheckError) {
                // If we can't find the bucket, it's definitely missing or we have no permission
                setShowBucketError(true);
            } else {
                toast.error(error.message || 'Failed to upload photo. Please try again.');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSwitchRole = async () => {
        const targetRole = profile.role === 'wholesaler' ? 'retailer' : 'wholesaler';
        try {
            setSwitchingRole(true);
            await updateRole(targetRole);
            toast.success(`Account successfully set to ${targetRole === 'wholesaler' ? 'Wholesaler' : 'Retailer'}!`);
            onUpdate();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to switch role');
        } finally {
            setSwitchingRole(false);
        }
    };

    return (
        <div className="relative rounded-3xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-4 sm:p-8 backdrop-blur-xl overflow-hidden mb-8 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start text-center md:text-left w-full min-w-0">
                {/* Avatar Section */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur opacity-70 group-hover:opacity-100 transition-opacity" />
                    <Avatar className="w-32 h-32 border-4 border-white dark:border-zinc-950 relative shadow-xl">
                        <AvatarImage src={profile.profile_image_url} />
                        <AvatarFallback className="text-4xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                            {profile.name?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-500 transition-colors shadow-lg border-2 border-white dark:border-zinc-950">
                        <Camera className="w-4 h-4" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Info Section */}
                <div className="flex-1 space-y-3 sm:space-y-4 min-w-0 w-full">
                    <div className="min-w-0">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-3 sm:gap-4 mb-2 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight truncate max-w-full">{profile.business_name}</h1>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="outline" className={`
                                                ${profile.role === 'founder'
                                                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                                                    : profile.role === 'employee'
                                                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                                    : profile.role === 'wholesaler'
                                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30'
                                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30'}
                                                capitalize px-3 py-1 text-sm cursor-help font-semibold`
                                            }>
                                                {profile.role}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>This is your registered account role.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {(profile.role === 'retailer' || profile.role === 'wholesaler') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={switchingRole}
                                        onClick={handleSwitchRole}
                                        className="h-7 text-xs px-2.5 rounded-lg border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
                                    >
                                        {switchingRole
                                            ? 'Switching...'
                                            : profile.role === 'wholesaler'
                                            ? 'Switch to Retailer'
                                            : 'Switch to Wholesaler'}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap text-zinc-500 dark:text-neutral-400 items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-zinc-700 dark:text-zinc-100 font-medium truncate max-w-[140px] sm:max-w-none">{profile.name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shrink-0">Owner</span>
                            </div>
                            {profile.business_type && (
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {profile.business_type}
                                </div>
                            )}
                            {profile.location && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {profile.location}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5" />
                                Est. {profile.years_in_business || '2024'}
                            </div>
                        </div>
                    </div>

                    {/* Trust Stats */}
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">Trust Score</div>
                                <div className="text-xl font-bold text-zinc-900 dark:text-white tabular-nums">{profile.trust_score ?? 500} <span className="text-xs font-normal text-zinc-500">/ 1000</span></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">Verification</div>
                                <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                                    {profile.gst_verified ? 'GST Verified' : 'Basic Level'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={showBucketError} onOpenChange={setShowBucketError}>
                <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 dark:text-red-400 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            Storage Bucket Missing
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                            The "avatars" storage bucket does not exist in your Supabase project.
                            Please run the following SQL command in your Supabase SQL Editor to fix this:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-zinc-900 p-4 rounded-md border border-white/5 font-mono text-xs overflow-x-auto relative group">
                        <pre className="text-blue-300">
                            {`-- Create "avatars" bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Allow authenticated uploads
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );`}
                        </pre>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 text-xs bg-white/10 hover:bg-white/20"
                            onClick={() => {
                                navigator.clipboard.writeText(`INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING; CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' ); CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );`);
                                toast.success("SQL copied to clipboard!");
                            }}
                        >
                            Copy SQL
                        </Button>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setShowBucketError(false)} className="border-white/10 hover:bg-white/5">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
