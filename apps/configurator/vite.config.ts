import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const hmrHost = process.env.VITE_HMR_HOST;
const hmrClientPort = process.env.VITE_HMR_CLIENT_PORT;
const hmrPath = process.env.VITE_HMR_PATH;

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? '/',

  server: {
    hmr: hmrHost || hmrClientPort || hmrPath
      ? {
          host: hmrHost,
          clientPort: hmrClientPort ? Number(hmrClientPort) : undefined,
          path: hmrPath,
        }
      : undefined,
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
});
