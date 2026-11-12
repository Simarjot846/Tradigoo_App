'use client';

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export function SecuritySettingsForm({ profile }: { profile: any }) {

    const handlePasswordReset = async () => {
        const supabase = createClient();
        if (!profile.email) return;

        const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        if (error) {
            toast.error("Failed to send reset email.");
        } else {
            toast.success("Password reset email sent!");
        }
    }

    return (
        <div className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-zinc-100 shadow-sm dark:shadow-none">
                <CardHeader>
                    <CardTitle>Security Preferences</CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">Manage your account security and authentication.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/5">
                        <div>
                            <h4 className="font-medium text-zinc-900 dark:text-white">Password</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Change your login password.</p>
                        </div>
                        <Button variant="outline" onClick={handlePasswordReset} className="border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300">
                            Reset Password
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/5">
                        <div>
                            <h4 className="font-medium text-zinc-900 dark:text-white">Two-Factor Authentication</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add an extra layer of security.</p>
                        </div>
                        <Button variant="outline" disabled className="border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500 opacity-50 cursor-not-allowed">
                            Coming Soon
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20 text-zinc-900 dark:text-zinc-100 shadow-sm dark:shadow-none">
                <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                    <CardDescription className="text-red-600/70 dark:text-red-400/70">Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-500/10">
                        <div>
                            <h4 className="font-medium text-red-900 dark:text-white">Delete Account</h4>
                            <p className="text-sm text-red-700 dark:text-zinc-400">Permanently delete your account and all data.</p>
                        </div>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
