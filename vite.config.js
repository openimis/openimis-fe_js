import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import svgr from "vite-plugin-svgr";
import envCompatible from "vite-plugin-env-compatible";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";

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
    dedupe: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@mui/system"
    ],
    alias: {
      //<<DYNMANIC_ALIAS_PLACEHOLDER>>
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "lodash": path.resolve(__dirname, "./node_modules/lodash"),
      "react-redux": path.resolve(__dirname, "./node_modules/react-redux"),
      // "@mui/material": path.resolve(__dirname, "./node_modules/@mui/material"),
      // "@mui/icons-material": path.resolve(__dirname, "./node_modules/@mui/icons-material"),
      // "@mui/system": path.resolve(__dirname, "./node_modules/@mui/system"),
      // "@mui/x-data-grid": path.resolve(__dirname, "./node_modules/@mui/x-data-grid"),
      "@emotion/react": path.resolve(__dirname, "./node_modules/@emotion/react"),
      "@emotion/styled": path.resolve(__dirname, "./node_modules/@emotion/styled"),
      "clsx": path.resolve(__dirname, "./node_modules/clsx"),
      "react-intl": path.resolve(__dirname, "./node_modules/react-intl"),
      "lodash/debounce": path.resolve(__dirname, "./node_modules/lodash.debounce"),
      "zxcvbn": path.resolve(__dirname, "./node_modules/zxcvbn"),
      "react-router": path.resolve(__dirname, "./node_modules/react-router"),
      "react-router-dom": path.resolve(__dirname, "./node_modules/react-router-dom"),
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
      "redux": path.resolve(__dirname, "./node_modules/redux"),
    },
    // preserveSymlinks :false
  },
  server: {
    port: 3000,
    fs: {
      allow: [".."],
    },
    proxy: {
      "/api": {
        target: "http://localhost:8000",
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
      "lodash",
      "clsx",
      "react-intl",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "@mui/system",
      "react-to-print",
      "@mui/utils",
      "@mui/styled-engine",
    ],
    force: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "static",
    sourcemap: true,
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-redux", "redux"],
          materialui: ["@mui/material", "@mui/icons-material", "@mui/x-date-pickers"],
        },
      },
    },
    commonjsOptions: {
      requireReturnsDefault: "auto",
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  define: {
    "process.env.PUBLIC_URL": JSON.stringify("/front"),
  },
  base: "/front/",
});