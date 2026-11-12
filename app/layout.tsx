import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ChatbotWrapper } from "@/components/chatbot-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { RoleThemeProvider } from "@/lib/theme-context";
import { Navbar } from "@/components/navbar";
import { ThemePersistence } from "@/components/theme-persistence";
import { CartProvider } from "@/lib/cart-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { ErrorSuppression } from "./error-suppression";
import { SessionRestorer } from "@/components/session-restorer";
import { CapacitorInitializer } from "@/components/capacitor-initializer";
import { NativeAppHandoff } from "@/components/auth/native-app-handoff";
import { Suspense } from "react";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Tradigoo — B2B Wholesale Marketplace & Escrow Sourcing Platform",
  description:
    "Verified Indian B2B wholesale marketplace connecting retailers and GST-verified suppliers with escrow payment protection, transparent MOQ pricing, and OTP-verified logistics.",
  openGraph: {
    title: "Tradigoo — B2B Wholesale Marketplace & Escrow Sourcing Platform",
    description:
      "Verified Indian B2B wholesale marketplace with escrow protection, transparent GST invoicing, and direct supplier sourcing.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  verification: {
    google: "W3BOWeDrvJp5HaWIo-ttCbwpGraJi_njzxt2SjhPtWw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 overflow-x-hidden`}
      >
        <SessionRestorer />
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <ErrorSuppression />
              <CapacitorInitializer />
              <CartProvider>
                <RoleThemeProvider>
                  <NativeAppHandoff />
                  <Suspense fallback={<div className="h-14 sm:h-16 w-full bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800" />}>
                    <Navbar />
                  </Suspense>
                  <ThemePersistence />
                  <div className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0">
                    {children}
                  </div>
                </RoleThemeProvider>
              </CartProvider>
              <ChatbotWrapper />
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
