import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import svgr from "vite-plugin-svgr";
import envCompatible from "vite-plugin-env-compatible";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      include: /.(jsx|js|ts|tsx)$/, 
    }),
    svgr(),
    envCompatible(),
    ...(mode === 'production' ? [legacy({
      targets: [">0.2%", "not dead", "not op_mini all"],
    })] : []),
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
    dedupe: [
      "react",
      "react-dom",
      "react-redux",
      "redux",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-intl",
      "react-router",
      "react-router-dom",
      "@emotion/react",
      "@emotion/styled",
      "@emotion/cache",
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@mui/x-data-grid",
      "@mui/system",
      "@mui/utils",
      "@mui/styled-engine",
      "@mui/private-theming",
      "dayjs",
      "lodash",
      "lodash-uuid",
      "moment",
      "flat",
      "classnames",
      "prop-types",
      "react-multi-date-picker",
      "rc-cascader",
      "redux-api-middleware",
      "hot-formula-parser",
      "react-to-print",
      "@material-table/core",
      "@mui/styles",
      "@openimis/fe-core",
      "@sentry/react",
      "@reduxjs/toolkit",
    ],
    alias: {
      //<<DYNAMIC_ALIAS_PLACEHOLDER>>
      
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
            "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
            "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime"),
      "lodash": path.resolve(__dirname, "./node_modules/lodash"),
      "lodash-uuid": path.resolve(__dirname, "./node_modules/lodash-uuid"),
      "react-redux": path.resolve(__dirname, "./node_modules/react-redux"),
      "@mui/material": path.resolve(__dirname, "./node_modules/@mui/material/esm"),
      "@mui/material/styles": path.resolve(__dirname, "./node_modules/@mui/material/styles"),
      "@mui/system": path.resolve(__dirname, "./node_modules/@mui/system/esm"),
      "@mui/x-data-grid": path.resolve(__dirname, "./node_modules/@mui/x-data-grid"),
      "@mui/x-date-pickers": path.resolve(__dirname, "./node_modules/@mui/x-date-pickers"),
      "@mui/x-date-pickers/LocalizationProvider": path.resolve(
        __dirname,
        "./node_modules/@mui/x-date-pickers/LocalizationProvider"
      ),
      "@mui/x-date-pickers/AdapterDayjs": path.resolve(
        __dirname,
        "./node_modules/@mui/x-date-pickers/AdapterDayjs"
      ),
      "@emotion/react": path.resolve(__dirname, "./node_modules/@emotion/react"),
      "@emotion/styled": path.resolve(__dirname, "./node_modules/@emotion/styled"),
      "@emotion/cache": path.resolve(__dirname, "./node_modules/@emotion/cache"),
      "@mui/utils": path.resolve(__dirname, "./node_modules/@mui/utils/esm"),
      "@mui/utils/deepmerge": path.resolve(
        __dirname,
        "./node_modules/@mui/utils/esm/deepmerge/index.js"
      ),
      "@mui/private-theming": path.resolve(__dirname, "./node_modules/@mui/private-theming"),
      "@mui/styled-engine": path.resolve(__dirname, "./node_modules/@mui/styled-engine"),
      "clsx": path.resolve(__dirname, "./node_modules/clsx"),
      "react-intl": path.resolve(__dirname, "./node_modules/react-intl"),
      "lodash/debounce": path.resolve(__dirname, "./node_modules/lodash.debounce"),
      "zxcvbn": path.resolve(__dirname, "./node_modules/zxcvbn"),
      "react-router": path.resolve(__dirname, "./node_modules/react-router"),
      "react-router-dom": path.resolve(__dirname, "./node_modules/react-router-dom"),
      "react-helmet": path.resolve(__dirname, "./node_modules/react-helmet"),
      "nepali-date-converter": path.resolve(__dirname, "./node_modules/nepali-date-converter"),
      "react-date-object": path.resolve(__dirname, "./node_modules/react-date-object"),
      "react-date-object/calendars/gregorian": path.resolve(
        __dirname,
        "./node_modules/react-date-object/calendars/gregorian"
      ),
      "react-date-object/locales/gregorian_en": path.resolve(
        __dirname,
        "./node_modules/react-date-object/locales/gregorian_en"
      ),
      "dayjs": path.resolve(__dirname, "./node_modules/dayjs"),
      "moment": path.resolve(__dirname, "./node_modules/moment"),
      "flat": path.resolve(__dirname, "./node_modules/flat"),
      "classnames": path.resolve(__dirname, "./node_modules/classnames"),
      "prop-types": path.resolve(__dirname, "./node_modules/prop-types"),
      "react-multi-date-picker": path.resolve(__dirname, "./node_modules/react-multi-date-picker"),
      "rc-cascader": path.resolve(__dirname, "./node_modules/rc-cascader"),
      "redux-api-middleware": path.resolve(__dirname, "./node_modules/redux-api-middleware"),
      "hot-formula-parser": path.resolve(__dirname, "./node_modules/hot-formula-parser"),
      "react-to-print": path.resolve(__dirname, "./node_modules/react-to-print"),
      "redux": path.resolve(__dirname, "./node_modules/redux"),
      "@reduxjs/toolkit": path.resolve(__dirname, "./node_modules/@reduxjs/toolkit"),
      "@material-table/core": path.resolve(__dirname, "./node_modules/@material-table/core"),
      "@mui/styles": path.resolve(__dirname, "./node_modules/@mui/styles"),
    },
    // preserveSymlinks :false
  },
  server: {
    port: 3000,
    fs: {
      allow: [".."],
    },
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Point at an authorizing proxy with OPENSEARCH_PROXY_TARGET; the
      // default reaches Dashboards directly.
      "/opensearch": {
        target:
          loadEnv(mode, ".", "").OPENSEARCH_PROXY_TARGET ||
          "http://localhost:5601",
        changeOrigin: true,
      }
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-redux",
      "redux",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "lodash",
      "dayjs",
      "clsx",
      "flat",
      "rc-cascader",
      "redux-api-middleware",
      "hot-formula-parser",
      "react-to-print",
      "react-intl",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/system",
      "@mui/utils",
      "@mui/utils/deepmerge",
      "@mui/styled-engine",
      "@material-table/core",
      "@mui/styles",
      "@sentry/react",
      "@reduxjs/toolkit",
    ],
    needsInterop: ["@mui/utils", "@mui/utils/deepmerge"],
    force: true,
    esbuildOptions: {
      loader: { ".js": "jsx" },
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "static",
    sourcemap: true,
    minify: mode === 'production',
    rollupOptions: {
      maxParallelFileOps: 1,
       output: {
         manualChunks: (id) => {
           if (["react", "@mui/material"].some(dep => id.includes(dep))) {
             return 'framework';
           }
           if (["react-dom", "react-redux", "redux"].some(dep => id.includes(dep))) {
             return 'fm-addin';
           }
           if (id.includes('CoreModule')) {
             return 'core';
           }
         },
       },
    },
    commonjsOptions: {
      requireReturnsDefault: "auto",
      include: [/node_modules\/(?!@openimis)/],
      transformMixedEsModules: true,
    },
  },
  define: {
    "process.env.PUBLIC_URL": JSON.stringify("/front"),
  },
  base: "/front/",
}));