import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import svgr from 'vite-plugin-svgr';
import envCompatible from 'vite-plugin-env-compatible';
import { createHtmlPlugin } from 'vite-plugin-html';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    envCompatible(),
    legacy({
      targets: ['>0.2%', 'not dead', 'not op_mini all'],
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'openIMIS',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-redux': path.resolve('./node_modules/react-redux'),
      '@material-ui': path.resolve('./node_modules/@material-ui'),
    },
  },
  server: {
    port: 3000,
    proxy: require('./src/setupProxy'),
  },
  build: {
    outDir: 'build',
    assetsDir: 'static',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-redux', 'redux'],
          materialui: ['@material-ui/core', '@material-ui/icons', '@material-ui/lab', '@material-ui/pickers'],
        },
      },
    },
  },
  define: {
    'process.env.PUBLIC_URL': JSON.stringify('/front'),
  },
  base: '/front/',
});
