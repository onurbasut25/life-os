import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lifeos.app',
  appName: 'Life OS',
  // Canlı Vercel adresinizi buraya bağlayarak mobil uygulamanın 
  // her zaman en güncel web sürümü ve sunucuyla senkron kalmasını sağlıyoruz
  server: {
    url: 'https://sonic-perseus-ftoy4ti-eb8138go8-onurbasut25-2941.vercel.app',
    cleartext: true,
  },
};

export default config;
