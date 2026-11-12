'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useState } from "react"

const personalFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email.",
    }),
    phone: z.string().min(10, {
        message: "Phone number must be at least 10 digits.",
    }),
    location: z.string().min(3, {
        message: "Location must be at least 3 characters.",
    }),
    language_preference: z.enum(["en", "hi"] as const),
})

type PersonalFormValues = z.infer<typeof personalFormSchema>

export function PersonalInfoForm({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PersonalFormValues>({
        resolver: zodResolver(personalFormSchema),
        defaultValues: {
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            location: profile.location || "",
            language_preference: (profile.language_preference as "en" | "hi") || "en",
        },
    })

    async function onSubmit(data: PersonalFormValues) {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', profile.id);

            if (error) throw error;

            toast.success("Profile updated successfully!");
            onUpdate();
        } catch (error: any) {
            console.error("Full Error Object:", error);
            console.error("Error Message:", error.message);
            console.error("Error Details:", error.details);
            console.error("Profile ID:", profile.id);

            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-zinc-100 shadow-sm dark:shadow-none">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">Manage your personal details and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name / Owner Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name" {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input disabled placeholder="email@example.com" {...field} className="bg-zinc-100 dark:bg-zinc-950/30 border-zinc-200 dark:border-white/5 opacity-70 cursor-not-allowed text-zinc-500 dark:text-zinc-400" />
                                        </FormControl>
                                        <FormDescription>Email cannot be changed directly.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+91..." {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City / Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Pune, Maharashtra" {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Simple Radio/Select for Language could go here */}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white min-w-[120px]" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
