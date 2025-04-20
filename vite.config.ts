import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [
    angular(),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'DYNAMIC_IMPORT_VARIABLES') {
          return;
        }
        warn(warning);
      }
    }
  }
});