import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Scanner engine - large ZXing / html5-qrcode library (~1.2MB unminified)
            if (id.includes('html5-qrcode')) {
              return 'vendor-scanner';
            }
            // Motion engine - framer-motion
            if (
              id.includes('framer-motion') ||
              id.includes('motion-dom') ||
              id.includes('motion-utils')
            ) {
              return 'vendor-motion';
            }
            // QR code generation
            if (id.includes('qrcode.react')) {
              return 'vendor-qrcode';
            }
            // Core React framework runtime
            if (
              id.includes('/react/') ||
              id.includes('react-dom') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }
            // Client-side router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // State management and HTTP client
            if (id.includes('axios') || id.includes('zustand')) {
              return 'vendor-core';
            }
          }
        },
      },
    },
  },
})
