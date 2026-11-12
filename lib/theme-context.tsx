"use client"

import * as React from "react"

type Theme = "retailer" | "wholesaler" | null

interface RoleThemeContextType {
    roleTheme: Theme
}

const RoleThemeContext = React.createContext<RoleThemeContextType | undefined>(undefined)

export function RoleThemeProvider({ children }: { children: React.ReactNode }) {
    // const { user } = useAuth() // No longer needed as role-based theming is removed
    const [roleTheme, setRoleTheme] = React.useState<Theme>(null) // roleTheme will always be null

    React.useEffect(() => {
        // Unified Theme: We are no longer setting data-role based on user type to ensure consistent UI.
        // Customizations are now handled at the component level.
        document.documentElement.removeAttribute("data-role")
    }, [])

    return (
        <RoleThemeContext.Provider value={{ roleTheme }}>
            {children}
        </RoleThemeContext.Provider>
    )
}

export const useRoleTheme = () => {
    const context = React.useContext(RoleThemeContext)
    if (context === undefined) {
        throw new Error("useRoleTheme must be used within a RoleThemeProvider")
    }
    return context
}
