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

// A `file:` fe-core gets an alias to its src/ from load-config, so the subpath
// rides along; one installed from git or npm does not, which is CI's case.
function coreTestingPath() {
  const candidates = [
    ...localModules()
      .filter(({ name }) => name === "fe-core")
      .map(({ root }) => root),
    path.resolve(ASSEMBLY_ROOT, "node_modules/@openimis/fe-core"),
  ];
  return candidates.map((root) => path.join(root, "src/testing")).find((dir) => fs.existsSync(dir));
}

const CORE_TESTING = coreTestingPath();

// Test libs live only in the assembly's node_modules; a module test file cannot
// reach them by directory walk, so resolve them from the root like react et al.
const sharedResolve = {
  ...viteResolve,
  alias: {
    // Vite matches string aliases by prefix, so this must precede the fe-core one.
    ...(CORE_TESTING ? { "@openimis/fe-core/testing": CORE_TESTING } : {}),
    ...viteResolve.alias,
  },
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
