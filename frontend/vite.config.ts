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
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          
          // UI and Animation libraries
          'ui-vendor': ['framer-motion', 'lucide-react'],
          
          // Chart and visualization libraries
          'charts-vendor': ['chart.js', 'react-chartjs-2'],
          
          // Map libraries (separate chunk for large mapping dependencies)
          'maps-vendor': ['leaflet', 'react-leaflet'],
          
          // Utility libraries
          'utils-vendor': ['axios'],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Split chunks automatically
    chunkSizeWarningLimit: 800, // Reduce warning limit to encourage smaller chunks
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
