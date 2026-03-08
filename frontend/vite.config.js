import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      // Polling is more reliable than fs events for Docker bind mounts on Windows.
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      interval: Number(process.env.CHOKIDAR_INTERVAL || 120),
    },
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      clientPort: Number(process.env.VITE_HMR_PORT || 3000),
    },
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'process.env': {}
  }
})