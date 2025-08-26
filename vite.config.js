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
      "@mui/x-date-pickers",
      "@mui/x-data-grid",
      "@mui/system"
    ],
    alias: {
    
      "@openimis/fe-core": path.resolve(__dirname, "../openimis-fe-core_js/src"),
      "@openimis/fe-claim": path.resolve(__dirname, "../openimis-fe-claim_js/src"),
      "@openimis/fe-location": path.resolve(__dirname, "../openimis-fe-location_js/src"),
      "@openimis/fe-medical": path.resolve(__dirname, "../openimis-fe-medical_js/src"),
      "@openimis/fe-medical_pricelist": path.resolve(__dirname, "../openimis-fe-medical_pricelist_js/src"),
      "@openimis/fe-social_protection": path.resolve(__dirname, "../openimis-fe-social_protection_js/src"),
      "@openimis/fe-insuree": path.resolve(__dirname, "../openimis-fe-insuree_js/src"),
      "@openimis/fe-home": path.resolve(__dirname, "../openimis-fe-home_js/src"),
      "@openimis/fe-opensearch_reports": path.resolve(__dirname, "../openimis-fe-opensearch_reports_js/src"),
      "@openimis/fe-individual": path.resolve(__dirname, "../openimis-fe-individual_js/src"),
      "@openimis/fe-policy": path.resolve(__dirname, "../openimis-fe-policy_js/src"),
      "@openimis/fe-contribution": path.resolve(__dirname, "../openimis-fe-contribution_js/src"),
      "@openimis/fe-payment": path.resolve(__dirname, "../openimis-fe-payment_js/src"),
      "@openimis/fe-claim_batch": path.resolve(__dirname, "../openimis-fe-claim_batch_js/src"),
      "@openimis/fe-admin": path.resolve(__dirname, "../openimis-fe-admin_js/src"),
      "@openimis/fe-tools": path.resolve(__dirname, "../openimis-fe-tools_js/src"),
      "@openimis/fe-profile": path.resolve(__dirname, "../openimis-fe-profile_js/src"),
      "@openimis/fe-calculation": path.resolve(__dirname, "../openimis-fe-calculation_js/src"),
      "@openimis/fe-policyholder": path.resolve(__dirname, "../openimis-fe-policyholder_js/src"),
      "@openimis/fe-invoice": path.resolve(__dirname, "../openimis-fe-invoice_js/src"),
      "@openimis/fe-contribution_plan": path.resolve(__dirname, "../openimis-fe-contribution_plan_js/src"),
      "@openimis/fe-deduplication": path.resolve(__dirname, "../openimis-fe-deduplication_js/src"),
      "@openimis/fe-claim_sampling": path.resolve(__dirname, "../openimis-fe-claim_sampling_js/src"),
      "@openimis/fe-contract": path.resolve(__dirname, "../openimis-fe-contract_js/src"),
      "@openimis/fe-grievance_social_protection": path.resolve(
        __dirname,
        "../openimis-fe-grievance_social_protection_js/src"
      ),
      "@openimis/fe-language_fr": path.resolve(__dirname, "../openimis-fe-language_fr_js/src"),
      "@openimis/fe-payer": path.resolve(__dirname, "../openimis-fe-payer_js/src"),
      "@openimis/fe-payment_cycle": path.resolve(__dirname, "../openimis-fe-payment_cycle_js/src"),
      "@openimis/fe-payroll": path.resolve(__dirname, "../openimis-fe-payroll_js/src"),
      "@openimis/fe-product": path.resolve(__dirname, "../openimis-fe-product_js/src"),
      "@openimis/fe-tasks_management": path.resolve(__dirname, "../openimis-fe-tasks_management_js/src"),

   
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "lodash": path.resolve(__dirname, "./node_modules/lodash"),
      "react-redux": path.resolve(__dirname, "./node_modules/react-redux"),
      // "@mui/material": path.resolve(__dirname, "./node_modules/@mui/material"),
      // "@mui/icons-material": path.resolve(__dirname, "./node_modules/@mui/icons-material"),
      // "@mui/system": path.resolve(__dirname, "./node_modules/@mui/system"),
      // "@mui/x-data-grid": path.resolve(__dirname, "./node_modules/@mui/x-data-grid"),
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