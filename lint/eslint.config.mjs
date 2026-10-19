// Correctness lint for openIMIS frontend modules - the frontend's flake8 F-codes.
//
// Run by .github/workflows/module-lint.yml against a module's src/, ignoring the
// module's own config. Each module may keep its own style config (airbnb etc.)
// for local use; this one is deliberately narrow so that it can block CI:
//
//   error - the code is wrong and fails when it runs: an unbound name, an import
//           the target does not export, a case that can never match. A bundler
//           does not catch these; OP-3190 shipped six pages that crashed on
//           render with `ReferenceError: setConfirmedAction is not defined`.
//   warn  - reported as annotations, not blocking. Promote a rule to error once
//           every module is clean of it.
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  { ignores: ["**/dist/**", "**/node_modules/**", "**/build/**", "**/coverage/**"] },
  {
    files: ["**/*.{js,jsx,mjs}"],
    // jsx-a11y is loaded with no rules enabled: modules carry
    // `eslint-disable jsx-a11y/...` comments, and a directive naming an unknown
    // rule is itself an error.
    plugins: { react, "react-hooks": reactHooks, import: importPlugin, "jsx-a11y": jsxA11y },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      // `process.env.*` is replaced by vite's `define` at build time.
      globals: { ...globals.browser, ...globals.es2021, process: "readonly" },
    },
    settings: {
      react: { version: "18" },
      "import/resolver": { node: { extensions: [".js", ".jsx"] } },
    },
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: {
      // Unbound names - ReferenceError when the line runs.
      "no-undef": ["error", { typeof: false }],
      "react/jsx-no-undef": "error",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",

      // Imports that resolve to nothing. Package imports (@openimis/*, react,
      // MUI) are installed by the assembly, not the module, so only relative
      // paths are checked for existence.
      "import/no-unresolved": ["error", { ignore: ["^[^.]"] }],
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/export": "error",

      // Code that can never do what it says.
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-dupe-class-members": "error",
      "no-duplicate-case": "error",
      "no-const-assign": "error",
      "no-func-assign": "error",
      "no-import-assign": "error",
      "no-class-assign": "error",
      "no-self-assign": "error",
      "no-unreachable": "error",
      "no-unsafe-negation": "error",
      "valid-typeof": "error",
      "use-isnan": "error",
      "getter-return": "error",
      "no-setter-return": "error",
      "constructor-super": "error",
      "no-this-before-super": "error",
      "no-obj-calls": "error",

      // Not blocking yet: hundreds of existing hits between them. no-redeclare
      // is mostly `var s` repeated across reducer cases, legal if untidy.
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-redeclare": "warn",
      "react/no-direct-mutation-state": "warn",
      "no-duplicate-imports": "warn",
      "react/jsx-key": "warn",
      "react-hooks/rules-of-hooks": "warn",
    },
  },
  {
    files: ["**/*.test.{js,jsx}", "**/__tests__/**", "**/testing/**", "**/setupTests.js"],
    languageOptions: { globals: { ...globals.node, ...globals.vitest, ...globals.jest } },
  },
];
