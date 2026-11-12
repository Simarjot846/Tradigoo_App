'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building, Shield, Settings, CreditCard } from "lucide-react";
import { PersonalInfoForm } from './forms/personal-info-form';
import { BusinessDetailsForm } from './forms/business-details-form';
import { SecuritySettingsForm } from './forms/security-settings-form';
import { TrustGstForm } from './forms/trust-gst-form';

import { useSearchParams } from 'next/navigation';

interface ProfileTabsProps {
    profile: any;
    onUpdate: () => void;
}

export function ProfileTabs({ profile, onUpdate }: ProfileTabsProps) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'personal';

    return (
        <Tabs key={activeTab} defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-900/50 p-1 rounded-2xl border border-zinc-200 dark:border-white/5 h-auto gap-1 mb-8 shadow-sm dark:shadow-none">
                <TabsTrigger
                    value="personal"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 rounded-xl py-3 gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                    <User className="w-4 h-4" />
                    Personal
                </TabsTrigger>
                <TabsTrigger
                    value="business"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 rounded-xl py-3 gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                    <Building className="w-4 h-4" />
                    Business
                </TabsTrigger>
                <TabsTrigger
                    value="trust"
                    className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 rounded-xl py-3 gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                    <Shield className="w-4 h-4" />
                    Trust & GST
                </TabsTrigger>
                <TabsTrigger
                    value="security"
                    className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white text-zinc-500 dark:text-zinc-400 rounded-xl py-3 gap-2 transition-all hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </TabsTrigger>
            </TabsList>

            <div className="mt-6">
                <TabsContent value="personal" className="focus-visible:outline-none">
                    <PersonalInfoForm profile={profile} onUpdate={onUpdate} />
                </TabsContent>

                <TabsContent value="business" className="focus-visible:outline-none">
                    <BusinessDetailsForm profile={profile} onUpdate={onUpdate} />
                </TabsContent>

                <TabsContent value="trust" className="focus-visible:outline-none">
                    <TrustGstForm profile={profile} onUpdate={onUpdate} />
                </TabsContent>

                <TabsContent value="security" className="focus-visible:outline-none">
                    <SecuritySettingsForm profile={profile} />
                </TabsContent>
            </div>
        </Tabs>
    );
}
