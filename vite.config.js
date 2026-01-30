import { defineConfig } from "vite";
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
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "@mui/x-data-grid",
      "@mui/system",
      "@openimis/fe-core"
    ],
    alias: {
      //<<DYNAMIC_ALIAS_PLACEHOLDER>>
"@openimis/fe-core": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/CoreModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-individual": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/IndividualModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-social_protection": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/SocialProtectionModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-opensearch_reports": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/OpenSearchReportsModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-home": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/HomeModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-location": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/LocationModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-insuree": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/InsureeModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-medical": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/MedicalModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-medical_pricelist": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/MedicalPriceListModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-product": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ProductModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-policy": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/PolicyModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-payer": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/PayerModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-contribution": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ContributionModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-payment": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/PaymentModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-claim": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ClaimModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-claim_batch": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ClaimBatchModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-admin": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/AdminModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-tools": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ToolsModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-profile": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ProfileModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-calculation": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/CalculationModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-policyholder": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/PolicyHolderModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-contribution_plan": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ContributionPlanModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-payment_cycle": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/PaymentCycleModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-contract": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ContractModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-tasks_management": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/TasksManagementModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-invoice": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/InvoiceModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-grievance_social_protection": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/GrievanceSocialProtectionModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-language_fr": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/LanguageFrModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-claim_sampling": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/ClaimSamplingModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-deduplication": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/DeduplicationModule','src'), //DYNAMIC_ALIAS,
"@openimis/fe-payroll": path.resolve('/mnt/data/Development/openimis-dev-tools/frontend-packages/PayrollModule','src'), //DYNAMIC_ALIAS,
            "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "lodash": path.resolve(__dirname, "./node_modules/lodash"),
      "react-redux": path.resolve(__dirname, "./node_modules/react-redux"),
      // "@mui/material": path.resolve(__dirname, "./node_modules/@mui/material"),
      // "@mui/icons-material": path.resolve(__dirname, "./node_modules/@mui/icons-material"),y
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
      "redux": path.resolve(__dirname, "./node_modules/redux"),
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
      "/opensearch": {
      target: "http://opensearch:5410",
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
    minify: mode === 'production',
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
}));