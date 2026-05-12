import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',

  server: {
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000',
    },
  },

  resolve: {
    alias: {
      '@printforge/ui': resolve(__dirname, '../../packages/ui/src'),
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      input: {
        designer: resolve(__dirname, 'designer.html'),
        productDetails: resolve(__dirname, 'product-details.html'),
      },
    },
  },
});
