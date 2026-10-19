# openIMIS Frontend Assembly — Agent Guide

The `frontend/` directory is the **React/Vite assembly shell** (`openimis-fe_js`). UI feature code lives in modules under `../frontend-packages/`, linked via `openimis.json` and installed as local `file:` npm dependencies.

## Directory map

```
frontend/
├── src/
│   ├── modules.jsx        # Auto-generated module registry (do not hand-edit)
│   ├── index.jsx          # App entry point
│   └── locales.jsx        # Auto-generated locale loader
├── openimis.json          # Module manifest (npm sources for CI/production)
├── openimis-dev.json      # Local dev manifest (file: paths to frontend-packages/)
├── openimis-config-vite.js # Regenerates package.json deps + modules.jsx
├── vite.config.js         # Dev server, proxy to backend (:8000), module aliases
├── package.json           # Assembly dependencies (includes file: module links)
├── docs/                  # Assembly-level docs (Docker, reverse proxy, menus)
└── dev_tools/             # Module install and CI scaffolding scripts
```

## How modules connect

1. Each entry in `openimis.json` / `openimis-dev.json` has a `name` (directory name, e.g. `CoreModule`) and `npm` source.
2. `node openimis-config-vite.js -c openimis-dev.json` reads the manifest and:
   - Updates `package.json` dependencies with `file:` paths to `frontend-packages/`
   - Generates `src/modules.jsx` and locale imports
3. `npm install --legacy-peer-deps` installs the assembly and links local modules.
4. `npm run start` (Vite) serves the app at `http://localhost:3000`, proxying `/api` to the backend.

Each package under `../frontend-packages/<ModuleName>/` is its own git repository (e.g. `openimis-fe-core_js` → `CoreModule/`).

## Running the frontend

```bash
cd frontend
node openimis-config-vite.js -c openimis-dev.json
npm install --include=dev --legacy-peer-deps
npm run start
```

For a fresh clone of all modules:

```bash
# from openimis-dev-tools root
python python/setup-local-dev.py
cd frontend
node dev_tools/entrypoint-dev.js -c openimis-dev.json -p ../frontend-packages/
node openimis-config-vite.js -c openimis-dev.json -p ../frontend-packages/
npm install --legacy-peer-deps
npm run start
```

## Module development rules

### peerDependencies

Shared libraries (`react`, `react-dom`, `@mui/material`, `redux`, etc.) must be declared as **`peerDependencies`** in the module's `package.json`, not bundled as direct dependencies. The assembly provides a single copy; duplicating them causes runtime errors.

### Reference module

Follow patterns in `../frontend-packages/CoreModule/` (menus, reducers, translations, Vite library build).

### Module structure

- Entry point exports the module class (e.g. `CoreModule`) with contributions (routes, reducers, menus).
- Source in `src/`; built output in `dist/` for published packages.
- Translations in `src/translations/<lang>.json`.
- Use `@openimis/fe-core` helpers for menus, formatting, GraphQL calls, and layout.
- An input or picker's "no value" is `null`/`undefined`, never `""` — `SelectInput` JSON-encodes its value, so an empty string reaches MUI as the literal `""`, matches no option, and triggers an out-of-range warning on every render.

### Linking a module for local work

1. Edit code in `../frontend-packages/<ModuleName>/`.
2. Rebuild if needed: `npm run build` or `npm run start` (watch) inside the module.
3. Vite hot-reloads most `src/` changes when the dev server is running.

To add a new module to the assembly, add it to `openimis-dev.json` and rerun `openimis-config-vite.js`.

## Code style

### Prettier

The assembly uses Prettier (`.prettierrc.json`: 120 print width, trailing commas).

```bash
cd frontend
npm run format
```

Individual modules typically expose their own `npm run format` (e.g. `prettier src -w` in CoreModule). Match the assembly settings when adding formatting to a new module.

### ESLint

**Run the correctness lint after every change to a module**, before committing:

```bash
cd frontend/lint && npm ci                       # once
cd frontend-packages/<Module>                    # run from the module, not from lint/
../../frontend/lint/node_modules/.bin/eslint -c ../../frontend/lint/eslint.config.mjs --no-config-lookup src
```

`lint/eslint.config.mjs` is the frontend's equivalent of flake8's `F` codes: narrow on purpose, and the same for every module, whatever the module's own ESLint config says.

- **error**: the code is wrong when it runs. That covers a name used but never declared, a relative import that resolves to nothing or names something the target does not export, and a `case` that can never match. A green `npm run build` proves none of this: Vite leaves these names alone and the page throws `ReferenceError` only when the line runs.
- **warn**: unused variables, duplicate imports, missing `key`, hook misuse. Reported, not blocking.

Do not leave an error behind, including in files you did not otherwise touch but did edit.

CI runs the same check: `module-ci-build.yml` has a `lint` job, so every module PR gets the findings as annotations. It is report-only while the `lintBlocking` input defaults to `false`, and becomes blocking once that default is flipped.

Base ESLint config is in `frontend/package.json` (`eslint:recommended`, `plugin:react/recommended`). That is the editor's style config, not the CI check above.

## Testing

**Vitest** runs from the assembly only — modules carry no runner of their own. `vitest.config.js` builds one project per test target: the assembly itself, plus every module declared in `openimis.json` / `openimis-dev.json` with an `@file:` spec. A module linked only through a `node_modules` symlink is **not** picked up, so link it in the manifest before expecting its tests to run.

```bash
cd frontend
npm test                    # vitest run, all projects
npx vitest                  # watch mode
npx vitest run SelectInput  # filter by path fragment
npx vitest run --project fe-claim   # one module: the package name without @openimis/
```

**Check that your module's tests actually ran.** If `npm test` lists only the `assembly` project, no module is declared with `@file:`: the `vite.config.js` aliases written by the dev setup do not count, and the run passes without testing any module. To test a module checkout or worktree that is not declared that way, use a throwaway config that reuses the assembly's project setup:

```js
// /tmp/vitest.module.mjs - run: npx vitest run -c /tmp/vitest.module.mjs --root .
import base from "<abs path>/frontend/vitest.config.js";
const p = base.test.projects[0];
export default { ...base, test: { ...base.test, projects: [{ ...p,
  server: { fs: { allow: ["/"] } },
  test: { ...p.test, name: "module", include: ["<abs module path>/src/**/*.test.{js,jsx}"], dir: "/" },
}] } };
```

Run the tests of every module you change after each change, together with the correctness lint above.

Projects are rooted at the assembly, not the module: react, MUI and redux are peerDependencies with a single copy here. `test/setup.js` registers jest-dom and per-test `cleanup`; mocks are cleared and restored between tests.

Conventions for tests in any module:

- Colocate `<Subject>.test.{js,jsx}` next to the subject, one file per subject — do not test a second component in a file named after another.
- Render components through `@openimis/fe-core/testing` (`renderWithProviders`, `makeStore`, `mockModulesManager`), which wraps theme, store, intl, router and the modules manager. That subpath is aliased in the Vitest config and must never be imported from production code.
- Prefer plain static imports; top-level `await import()` is only needed when a `vi.mock` has to be registered first.
- Mark known-broken behaviour with `it.fails` and a comment rather than deleting the test. An `it.fails` that starts passing is reported as a **failure**, so the change that fixes the behaviour must flip it to `it` in the same commit. Stale `it.fails` tests are what kept fe-core's own suite failing on `release/26.10`.

### Fixing a bug: the test comes first

1. **Capture the wrong behaviour** in a test before touching the code: it asserts the *correct* behaviour and fails for the reason the bug report describes, not because of a typo or a missing mock. Run it and read why it fails.
2. **That test is the definition of done.** Fix the code until it passes, without editing the test. Then run the module's whole suite and the lint.
3. **Do not change what the test asserts in order to make it pass.** If the fix shows the expected behaviour itself was wrong, that is a functional decision: stop and raise it with the user or the reviewer, and do not adjust the test silently. The same applies to an existing test that a change breaks: find out whether the test or the change is wrong before editing either.
4. Changes that only touch the harness, such as test data shape, a missing provider or a mock, are fine. Say so in the PR.

When the behaviour cannot be reached from a unit test (a full page needing a backend, for example), say so in the PR and list the manual check instead.

`passWithNoTests` is on, so targeting a module without tests does not fail CI. For UI changes, manual verification via `npm run start` against a running backend remains the primary workflow.

## Documentation

Update documentation in the **module repository**:

- **`README.md`** — module purpose, build commands, contribution points
- **`docs/`** — module-specific UI docs, component APIs, configuration

Assembly-level docs live in `frontend/docs/` (Docker setup, reverse proxy, menus). Do not put module-specific docs there.

## Build and release

```bash
npm run build     # production bundle → dist/
npm run preview   # preview production build
```

To publish a module to npm: bump `version` in the module's `package.json`, build, and publish from the module repo. The assembly's `openimis.json` pins versions for distributions.

Scaffold CI workflows for a module:

```bash
node dev_tools/addCIToModule.js <ModuleDirectoryName>
```

## Proxy and backend URL

In dev mode, Vite proxies API calls. If the backend is not on `localhost:8000`, update the proxy target in `vite.config.js` (and see `docs/reverse_proxy.md`).

## Regenerating local module links

```bash
# from openimis-dev-tools root
python python/setup-local-dev.py
cd frontend
node openimis-config-vite.js -c openimis-dev.json
npm install --legacy-peer-deps
```

## Important constraints

- Do not create backend users named `admin` or `Admin` — this breaks frontend login (Core ↔ tblUser link).
- Use `npm install --legacy-peer-deps` to avoid peer dependency conflicts across modules.
- Do not hand-edit `src/modules.jsx` — regenerate via `openimis-config-vite.js`.

## Related files

- `../AGENTS.md` — overall workspace layout
- `../backend/AGENTS.md` — backend testing, flake8, Django rules
- `i18n.md` — translation workflow
- `docs/menus.md` — menu contribution patterns