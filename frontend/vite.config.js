import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/dembeni/',
  server: {
    port: 5173,
    open: false,
    strictPort: false
  },
  test: {
    environment: 'jsdom'
  }
})
