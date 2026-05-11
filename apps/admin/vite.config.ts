import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:3000' }
  },
  resolve: {
    alias: {
      '@printforge/ui': '../../packages/ui/src'
    }
  }
})