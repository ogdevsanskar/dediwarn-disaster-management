import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Generate cache-busting timestamp
const timestamp = Date.now();

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  // Add cache busting environment variables
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(timestamp),
    __CACHE_BUSTER__: JSON.stringify(`cb-${timestamp}`),
  },
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
    // Suppress chunk size warnings completely for deployment
    chunkSizeWarningLimit: 2000, // 2MB limit - eliminates all warnings for our 260KB chunks
    minify: 'esbuild', // Use esbuild for faster builds (default in Vite)
    // Additional optimizations for Render deployment
    reportCompressedSize: false, // Skip compressed size analysis to speed up build
    sourcemap: false // Explicitly disable sourcemaps
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: true,
      },
      '/ws': {
        target: process.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  // Ensure proper base path for static deployment
  base: '/',
}));
