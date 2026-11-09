import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

import viteConfig from "./vite.config.js";

const ASSEMBLY_ROOT = import.meta.dirname;
const WORKSPACE_ROOT = path.resolve(ASSEMBLY_ROOT, "..");
const SETUP_FILE = path.resolve(ASSEMBLY_ROOT, "test/setup.js");

// Kept in a separate file: the openIMIS generators rewrite vite.config.js.
const viteResolve = viteConfig({ mode: "test", command: "serve" }).resolve;

// fe-core has no `exports` map and keeps its sources under src/, so a subpath such
// as `@openimis/fe-core/helpers/api` resolves against the package root and fails,
// whether fe-core is a `file:` checkout or installed from git or npm (CI's case).
// Tests use these subpaths to reach `testing` and to import a defining module
// directly, because the fe-core barrel imports itself.
function coreSrcPath() {
  const candidates = [
    ...localModules()
      .filter(({ name }) => name === "fe-core")
      .map(({ root }) => root),
    path.resolve(ASSEMBLY_ROOT, "node_modules/@openimis/fe-core"),
  ];
  return candidates.map((root) => path.join(root, "src")).find((dir) => fs.existsSync(path.join(dir, "testing")));
}

const CORE_SRC = coreSrcPath();

const aliasEntries = (alias = {}) =>
  Array.isArray(alias) ? alias : Object.entries(alias).map(([find, replacement]) => ({ find, replacement }));

// Test libs live only in the assembly's node_modules; a module test file cannot
// reach them by directory walk, so resolve them from the root like react et al.
const sharedResolve = {
  ...viteResolve,
  alias: [
    // Subpaths only: the bare `@openimis/fe-core` keeps resolving to the package
    // entry. It must precede the generated aliases, which match by prefix.
    ...(CORE_SRC ? [{ find: /^@openimis\/fe-core\/(?!dist\/)(.+)$/, replacement: `${CORE_SRC}/$1` }] : []),
    ...aliasEntries(viteResolve.alias),
  ],
  dedupe: [
    ...viteResolve.dedupe,
    "@testing-library/react",
    "@testing-library/dom",
    "@testing-library/user-event",
    "@testing-library/jest-dom",
  ],
};

function localModules() {
  const manifestPath = ["openimis-dev.json", "openimis.json"]
    .map((f) => path.resolve(ASSEMBLY_ROOT, f))
    .find((f) => fs.existsSync(f));
  if (!manifestPath) return [];

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  return (manifest.modules ?? []).flatMap((module) => {
    const [packageName, spec] = String(module.npm).split("@file:");
    if (!spec) return [];
    const root = path.resolve(ASSEMBLY_ROOT, spec);
    if (!fs.existsSync(path.join(root, "src"))) return [];
    return [{ name: packageName.split("/").pop(), root }];
  });
}

const projectDefaults = {
  environment: "jsdom",
  setupFiles: [SETUP_FILE],
  clearMocks: true,
  restoreMocks: true,
  // Env/global stubs must not survive a failing assertion into the next test.
  unstubEnvs: true,
  unstubGlobals: true,
};

// Rooted at the assembly, not the module: react/MUI/redux are peerDependencies
// with no copy inside a module, so resolution must start where the one copy is.
const project = ({ name, root }) => ({
  plugins: [react()],
  resolve: sharedResolve,
  server: { fs: { allow: [WORKSPACE_ROOT] } },
  test: {
    ...projectDefaults,
    name,
    root: ASSEMBLY_ROOT,
    include: [`${path.relative(ASSEMBLY_ROOT, root) || "."}/src/**/*.test.{js,jsx}`],
  },
});

export default defineConfig({
  resolve: sharedResolve,
  test: {
    // Modules gain tests incrementally; targeting an uncovered one must not fail CI.
    passWithNoTests: true,
    projects: [project({ name: "assembly", root: ASSEMBLY_ROOT }), ...localModules().map(project)],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      allowExternal: true,
      reportsDirectory: path.resolve(ASSEMBLY_ROOT, "coverage"),
      exclude: [
        "**/*.json",
        "**/modules.jsx",
        "**/locales.jsx",
        "**/translations/**",
        "**/testing/**",
        "**/*.test.{js,jsx}",
      ],
    },
  },
});
