'use client';

import { useEffect } from 'react';

export function ErrorSuppression() {
  useEffect(() => {
    // Suppress AbortError in development (caused by React Strict Mode double rendering)
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        // Check if the error message contains 'aborted' or 'AbortError'
        const isAbort = args.some(arg => {
          if (!arg) return false;
          const str = typeof arg === 'string' ? arg : (arg?.message || arg?.name || '');
          return (
            str.includes('AbortError') ||
            str.includes('signal is aborted') ||
            str.includes('aborted without reason')
          );
        });

        if (isAbort) {
          // Silently ignore these expected aborts during rapid dev remounts
          return;
        }

        // Log all other errors normally with full error information
        originalError.apply(console, args);
      };

      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return null;
}
