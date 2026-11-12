'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Cache data for 10 minutes by default for instant loads
                staleTime: 10 * 60 * 1000,
                gcTime: 15 * 60 * 1000,
                // Zero automatic retry loops to prevent lag cascades
                retry: false,
                // Disable background refetches on window focus or reconnect
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                networkMode: 'always',
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
