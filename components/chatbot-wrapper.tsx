"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Chatbot = dynamic(() => import("@/components/chatbot").then((mod) => mod.Chatbot), {
    ssr: false,
    loading: () => null,
});

export function ChatbotWrapper() {
    const pathname = usePathname();

    // Do not show floating chatbot on authentication or print invoice pages
    if (pathname.startsWith('/auth') || pathname.includes('/invoice')) {
        return null;
    }

    return <Chatbot />;
}
