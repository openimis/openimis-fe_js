import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import svgr from "vite-plugin-svgr";
import envCompatible from "vite-plugin-env-compatible";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";
// import { createViteProxy } from "./src/setupProxy.js";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    envCompatible(),
    legacy({
      targets: [">0.2%", "not dead", "not op_mini all"],
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: "openIMIS",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      //<<DYNMANIC_ALIAS_PLACEHOLDER>>
"@openimis/fe-core": path.resolve('/frontend-packages/CoreModule'), //DYNMANIC_ALIAS,
"@openimis/fe-location": path.resolve('/frontend-packages/LocationModule'), //DYNMANIC_ALIAS,
"@openimis/fe-language_fr": path.resolve('/frontend-packages/LanguageFrModule'), //DYNMANIC_ALIAS,
     'react': path.resolve(__dirname, './node_modules/react'),
      'lodash': path.resolve(__dirname, './node_modules/lodash'),
      'react-redux': path.resolve(__dirname, './node_modules/react-redux'),
      '@mui': path.resolve(__dirname, './node_modules/@mui'),
      'clsx': path.resolve(__dirname, './node_modules/clsx'),
      'react-intl': path.resolve(__dirname, './node_modules/react-intl'),
      'lodash/debounce': path.resolve(__dirname, './node_modules/lodash.debounce'),
      'zxcvbn': path.resolve(__dirname, './node_modules/zxcvbn'),
      'react-router': path.resolve(__dirname, './node_modules/react-router'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      'nepali-date-converter': path.resolve(__dirname, './node_modules/nepali-date-converter'),
      'react-date-object': path.resolve(__dirname, './node_modules/react-date-object'),
      'react-date-object/calendars/gregorian': path.resolve(__dirname, './node_modules/react-date-object/calendars/gregorian'),
      'react-date-object/locales/gregorian_en': path.resolve(__dirname, './node_modules/react-date-object/locales/gregorian_en'),
      'redux': path.resolve(__dirname, './node_modules/redux'),
    },
    preserveSymlinks: true,
  },
  server: {
    port: 3000,
    // proxy: createViteProxy()
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-redux",
      "redux",
      "react-date-object",
      "react-date-object/calendars/gregorian",
      "react-date-object/locales/gregorian_en",
      "@mui/icons-material/Add",
      "@mui/icons-material/Shuffle",
      "@mui/icons-material/Delete",
      "@mui/icons-material/Replay",
      "@mui/icons-material/ArrowDropDown",
      "@mui/icons-material/KeyboardArrowRight",
      "@mui/icons-material/Autorenew",
      "lodash/debounce",
      "lodash.debounce",
      "clsx",
      "react-intl",
      "zxcvbn",
      "react-router",
      "react-router-dom",
      "nepali-date-converter",
      "lodash"
    ],
    exclude: []
  },
  build: {
    outDir: "dist",
    assetsDir: "static",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-redux", "redux"],
          materialui: [
            "@mui/material",
            "@mui/icons-material",
            "@mui/lab",
            "@mui/x-date-pickers"
          ],
        },
      },
    },
  },
  define: {
    "process.env.PUBLIC_URL": JSON.stringify("/front"),
  },
  base: "/front/",
  // esbuild: {
  //   loader: "jsx",
  //   include: /src\/.*\.js$/, 
  // },
});
