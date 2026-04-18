import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.uberlingen.doctor',
  appName: 'Uberlingen Medico',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
