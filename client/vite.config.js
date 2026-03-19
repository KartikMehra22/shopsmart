import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy any /api request to the backend so we avoid CORS issues in dev
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
})
