'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

const businessFormSchema = z.object({
    business_name: z.string().min(2, "Business name is required"),
    business_type: z.string().optional(),
    business_address: z.string().optional(),
    gst_number: z.string().optional(), // In production add regex validation
    business_description: z.string().optional(),
})

type BusinessFormValues = z.infer<typeof businessFormSchema>

export function BusinessDetailsForm({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<BusinessFormValues>({
        resolver: zodResolver(businessFormSchema),
        defaultValues: {
            business_name: profile.business_name || "",
            business_type: profile.business_type || "",
            business_address: profile.business_address || "",
            gst_number: profile.gst_number || "",
            business_description: profile.business_description || "",
        },
    })

    async function onSubmit(data: BusinessFormValues) {
        setIsLoading(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('profiles')
                .update(data)
                .eq('id', profile.id);

            if (error) throw error;

            toast.success("Business details updated!");
            onUpdate();
        } catch (error: any) {
            console.error("Full Error Object:", error);
            console.error("Error Message:", error.message);
            console.error("Error Details:", error.details);
            console.error("Error Hint:", error.hint);
            console.error("Profile ID:", profile.id);
            console.error("Submission Data:", data);

            toast.error(error.message || "Failed to update details.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-white/5 text-zinc-900 dark:text-zinc-100 shadow-sm dark:shadow-none">
            <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription className="text-zinc-500 dark:text-zinc-400">Public information about your business or shop.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="business_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business / Shop Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Tradigoo Traders" {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="business_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Kirana Store, Supermarket, Electronics" {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white" />
                                        </FormControl>
                                        <FormDescription className="text-xs text-zinc-500">
                                            This is your store category, not your platform role.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gst_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>GST Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="27AAAAA0000A1Z5" {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-mono uppercase" />
                                        </FormControl>
                                        <FormDescription className="text-xs">Required for verification badge</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="business_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registered Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Shop 12, Market Yard..." {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="business_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Short Description (Bio)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Tell buyers/sellers about your business..." {...field} className="bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-white/10 min-h-[100px] text-zinc-900 dark:text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white min-w-[120px]" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Update Details
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
