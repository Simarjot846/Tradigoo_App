"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemePersistence() {
    const { theme } = useTheme()

    useEffect(() => {
        if (!theme) return
        try {
            localStorage.setItem('tradigoo_theme_preference', theme)
        } catch {
            // LocalStorage fallback
        }
    }, [theme])

    return null
}
