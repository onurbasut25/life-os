import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeos.app',
  appName: 'Life OS',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
