import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-redux': path.resolve('./node_modules/react-redux'),
      '@material-ui': path.resolve('./node_modules/@material-ui'),
    }
  },
  optimizeDeps: {
    include: [
      'react-app-polyfill/ie11',
      'react-app-polyfill/stable'
    ]
  },
  build: {
    outDir: 'build',
    sourcemap: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});