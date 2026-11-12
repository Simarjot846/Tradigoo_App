/**
 * API configuration helper for Tradigoo mobile & web.
 * Ensures relative API endpoints (/api/...) resolve properly when running
 * in native Capacitor mobile WebViews or remote API hosts.
 */
export function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${baseUrl}${cleanEndpoint}`;
}

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}
