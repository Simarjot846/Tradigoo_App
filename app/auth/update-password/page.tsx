'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/auth/auth-layout';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await updatePassword(password);
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout heroContent={
            <>
                <h1 className="text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
                    Update your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Password</span>.
                </h1>
                <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                    Choose a strong password to keep your account safe.
                </p>
            </>
        }>
            <div
                
                
                
            >
                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white font-bold text-xl">#</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Set New Password</h1>
                <p className="text-zinc-500 mb-8">Enter your new password below.</p>
            </div>

            <div
                
                
                
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-700">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-zinc-700">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-11 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-500/20"
                        disabled={loading}
                    >
                        {loading ? 'Updating Password...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
