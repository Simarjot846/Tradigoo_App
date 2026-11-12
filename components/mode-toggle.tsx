"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-context"

export function ModeToggle() {
    const { setTheme, theme } = useTheme()
    const { user } = useAuth()
    const supabase = createClient()

    // Sync with Supabase on change
    const handleThemeChange = async (newTheme: string) => {
        setTheme(newTheme)

        if (user) {
            try {
                // Optimistically update, errors logged but minimal disruption
                await supabase
                    .from('profiles')
                    .update({ theme_preference: newTheme })
                    .eq('user_id', user.id)
            } catch (err) {
                console.error("Failed to sync theme preference", err)
            }
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white rounded-full transition-colors">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/80 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white backdrop-blur-md">
                <DropdownMenuItem onClick={() => handleThemeChange("light")} className="cursor-pointer focus:bg-zinc-200/50 dark:focus:bg-zinc-800/50">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("dark")} className="cursor-pointer focus:bg-zinc-200/50 dark:focus:bg-zinc-800/50">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange("system")} className="cursor-pointer focus:bg-zinc-200/50 dark:focus:bg-zinc-800/50">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
