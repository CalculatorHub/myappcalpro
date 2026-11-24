import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'robots.txt', 'sitemap.xml', 'apple-touch-icon.png'],
    manifest: {
      id: '/',
      name: 'CalHub — FinCalc Pro Indian Finance & Tax Calculators',
      short_name: 'CalHub FinCalc',
      description: 'Practical Indian finance, tax, loan EMI and investment calculators with step-by-step explanations.',
      theme_color: '#6366F1',
      background_color: '#080D1B',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      orientation: 'portrait',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'service-worker.ts',
    devOptions: {
      enabled: false,
      type: 'module',
    },
  })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
