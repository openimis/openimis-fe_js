import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import svgr from "vite-plugin-svgr";
import envCompatible from "vite-plugin-env-compatible";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";
import { createViteProxy } from "./src/setupProxy.js";

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
      '@openimis/fe-core': path.resolve(__dirname, '../openimis-fe-core_js/src'),
      '@openimis/fe-claim': path.resolve(__dirname, '../openimis-fe-claim_js/src'),
      '@openimis/fe-location': path.resolve(__dirname, '../openimis-fe-location_js/src'),
      '@openimis/fe-medical': path.resolve(__dirname, '../openimis-fe-medical_js/src'),
      '@openimis/fe-medical_pricelist': path.resolve(__dirname, '../openimis-fe-medical_pricelist_js/src'),
      '@openimis/fe-social_protection': path.resolve(__dirname, '../openimis-fe-social_protection_js/src'),

      'react': path.resolve(__dirname, './node_modules/react'),
      'react-redux': path.resolve(__dirname, './node_modules/react-redux'),
      '@material-ui': path.resolve(__dirname, './node_modules/@material-ui'),
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
    },
    preserveSymlinks: true,
  },
  server: {
    port: 3000,
    proxy: createViteProxy(),
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
      "@material-ui/icons/Add",
      "@material-ui/icons/Shuffle",
      "@material-ui/icons/Delete",
      "@material-ui/icons/Replay",
      "@material-ui/icons/ArrowDropDown",
      "@material-ui/icons/KeyboardArrowRight",
      "@material-ui/icons/Autorenew",
      "lodash/debounce",
      "lodash.debounce",
      "clsx",
      "react-intl",
      "zxcvbn",
      "react-router",
      "react-router-dom",
      "nepali-date-converter"
    ],
    exclude: []
  },
  build: {
    outDir: "build",
    assetsDir: "static",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-redux", "redux"],
          materialui: [
            "@material-ui/core",
            "@material-ui/icons",
            "@material-ui/lab",
            "@material-ui/pickers"
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
