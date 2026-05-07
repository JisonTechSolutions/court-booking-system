import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/court-booking-system/", // REQUIRED for GitHub Pages
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})