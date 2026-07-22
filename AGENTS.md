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

Base ESLint config is in `frontend/package.json` (`eslint:recommended`, `plugin:react/recommended`). Modules should not introduce lint errors in `src/`.

## Testing

The assembly includes **Vitest** as a dev dependency. Module-level tests are not as standardized as backend Django tests; check each module for its own test setup.

```bash
cd frontend
npx vitest        # when tests exist
```

For UI changes, manual verification via `npm run start` against a running backend is the primary workflow.

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