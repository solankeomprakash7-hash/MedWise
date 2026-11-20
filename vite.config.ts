import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // public/assets holds the landing page's kit, so the app's bundles go to /_app
      assetsDir: '_app',
      // app.html: the clinical (sepsis) app at /app; ecg.html: MedWise ECG at /ecg. The landing page is the static public/index.html.
      rollupOptions: { input: { app: path.resolve(__dirname, 'app.html'), ecg: path.resolve(__dirname, 'ecg.html') } },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
