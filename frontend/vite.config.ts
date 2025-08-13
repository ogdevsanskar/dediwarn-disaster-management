import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Router libraries
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          
          // UI and Animation libraries
          if (id.includes('framer-motion') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          
          // Map libraries
          if (id.includes('leaflet')) {
            return 'maps-vendor';
          }
          
          // Chart libraries
          if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) {
            return 'charts-vendor';
          }
          
          // Utility libraries
          if (id.includes('axios') || id.includes('clsx') || id.includes('tailwind')) {
            return 'utils-vendor';
          }
          
          // Firebase and blockchain libraries
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          
          if (id.includes('ethers')) {
            return 'blockchain-vendor';
          }
          
          // Socket.io and communication
          if (id.includes('socket.io')) {
            return 'communication-vendor';
          }
          
          // Large utility libraries
          if (id.includes('dompurify') || id.includes('@tanstack') || id.includes('styled-components')) {
            return 'external-vendor';
          }
          
          // Split remaining node_modules into smaller chunks
          if (id.includes('node_modules')) {
            const chunks = ['vendor-a', 'vendor-b', 'vendor-c'];
            const hash = id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            return chunks[Math.abs(hash) % chunks.length];
          }
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Suppress chunk size warnings for production deployment
    chunkSizeWarningLimit: 1000, // 1MB limit - our largest chunk is 260KB which is acceptable
    minify: true, // Use default minification
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://disaster-management-backend-qtxs.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
        changeOrigin: true,
      }
    }
  },
}));
