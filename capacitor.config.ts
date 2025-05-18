import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.proyecto_grupo_3_vendedor.ccp-tendero',
  appName: 'ccp-tendero',
  webDir: 'www',
  server: {
    androidScheme: 'http',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      backgroundColor: '#3880ff',
      style: 'light',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
  },
  android: {
    backgroundColor: '#3880ff',
    allowMixedContent: true,
    appendUserAgent: 'HighMemoryApp',
  },
};

export default config;
