import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      REACT_APP_API_URL: JSON.stringify('/api')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/rest': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  base: '/front/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'build', // Keep the same output directory as CRA for compatibility
  }
});