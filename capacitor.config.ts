import type { CapacitorConfig } from '@capacitor/cli';

// Set your live Vercel deployment URL here
// For local dev/testing you can use your dev server IP:  http://192.168.x.x:3000
const LIVE_URL = process.env.CAPACITOR_SERVER_URL || 'https://tradigoo.vercel.app';

const config: CapacitorConfig = {
  appId: 'com.tradigoo.app',
  appName: 'Tradigoo',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // If a live URL is set, load from it (includes API routes).
    // Remove or leave empty to use bundled assets from 'out/' folder.
    ...(LIVE_URL ? { url: LIVE_URL, cleartext: true } : {}),
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#0a0a0a',
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a0a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
