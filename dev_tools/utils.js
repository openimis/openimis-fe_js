const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/**
 * Read and parse a JSON file synchronously.
 * 
 * @param {string} filePath - Path to the JSON file to read
 * @returns {object} Parsed JSON object
 * @throws {Error} If file cannot be read or JSON is invalid
 */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Load openIMIS configuration from CLI args, environment variable, or default file.
 * Priority: CLI args > env var OPENIMIS_CONF_JSON > ./openimis.json
 * 
 * @param {string[]} args - Command-line arguments (first arg is config file path)
 * @param {string} cwd - Current working directory for relative path resolution
 * @returns {object} Configuration object with modules and locales
 * @throws {Error} If no configuration file is found
 */
function loadConfig(args = [], cwd = process.cwd()) {
  const filteredArgs = (args || []).filter((arg) => arg !== "--dry-run");
  if (filteredArgs.length > 0) {
    const configPath = path.resolve(cwd, filteredArgs[0]);
    console.log(`  load configuration from '${filteredArgs[0]}'`);
    return readJson(configPath);
  }

  if (process.env.OPENIMIS_CONF_JSON) {
    console.log(`  load configuration from env`);
    return JSON.parse(process.env.OPENIMIS_CONF_JSON);
  }

  const defaultPath = path.resolve(cwd, "./openimis.json");
  if (fs.existsSync(defaultPath)) {
    console.log(`  load configuration from ./openimis.json`);
    return readJson(defaultPath);
  }

  throw new Error(
    "No configuration file found. Please provide a configuration in the CLI or in the OPENIMIS_CONF_JSON environment variable",
  );
}

/**
 * Write content to a file synchronously with UTF-8 encoding.
 * 
 * @param {string} filePath - Path to the file to write
 * @param {string} content - Content to write to file
 */
function writeFile(filePath, content, options = {}) {
  if (options.dryRun) {
    console.log(`[dry-run] would write file: ${filePath}`);
    return;
  }
  fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "w" });
}

/**
 * Process locale configuration and generate locales.js for React Intl.
 * Creates exports for locale list, file name mappings, and language-to-locale mapping.
 * 
 * @param {object} config - Configuration object containing locales array
 * @param {string} outputPath - Path where locales.js should be written (default: ./src/locales.js)
 */
function processLocales(config, outputPath = "./src/locales.js", options = {}) {
  const locales = Array.isArray(config.locales) ? config.locales : [];

  const localeByLang = locales.reduce((lcs, lc) => {
    (lc.languages || []).forEach((lg) => {
      lcs[lg] = lc.intl;
    });
    return lcs;
  }, {});

  const filesByLang = locales.reduce((fls, lc) => {
    (lc.languages || []).forEach((lg) => {
      fls[lg] = lc.fileNames;
    });
    return fls;
  }, {});

  const content = [
    `export const locales = ${JSON.stringify(locales.map((lc) => lc.intl))}`,
    `export const fileNamesByLang = ${JSON.stringify(filesByLang)}`,
    `/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */`,
    `export default ${JSON.stringify(localeByLang)}`,
  ].join("\n");

  writeFile(outputPath, content, options);
}

/**
 * Generate modules.js that exports a list of packages and a loadModules function.
 * The generated file is used by the frontend assembly to dynamically require and initialize modules.
 * 
 * @param {object[]} modules - Array of module objects with moduleName, name, logicalName properties
 * @param {string} outputPath - Path where modules.js should be written (default: ./src/modules.js)
 */
function generateModulesJs(modules, outputPath = "./src/modules.js", options = {}) {
  const content = `
export const packages = [
  ${modules.map(({ moduleName }) => `"${moduleName}"`).join(",\n  ")}
];

export function loadModules(cfg = {}) {
  const loadedModules = [];
${modules
    .map(({ name, logicalName, moduleName }) => {
      return `
  try {
    loadedModules.push(require("${moduleName}").${name ?? "default"}(cfg["${logicalName}"] || {}));
  } catch (error) {
    console.error('Failed to load module "${moduleName}". More details can be found in the developer console. Look for: ' + error);
    console.error(error);
  }
`;
    })
    .join("")}
  return loadedModules;
}
`;

  writeFile(outputPath, content.trimStart(), options);
}

/**
 * Extract canonical npm package name from a module config object.
 * Handles @openimis scoped packages and generates fallback names for modules.
 * 
 * @param {object} module - Module configuration object with npm and name properties
 * @returns {string|null} Canonical npm package name (e.g., @openimis/fe-core)
 */
function parseNpmPackageName(module) {
  if (!module || !module.npm) {
    return module?.name ? `@openimis/fe-${module.name.replace(/Module$/, "").toLowerCase()}` : null;
  }

  const npmMatch = module.npm.match(/(@openimis\/[^@]+)(?:@.+)?$/);
  if (npmMatch) {
    return npmMatch[1];
  }

  return `@openimis/fe-${module.name.replace(/Module$/, "").toLowerCase()}`;
}

/**
 * Extract semantic version from an npm package specification.
 * Returns null for file: references and non-versioned specs.
 * 
 * @param {string} npmSpec - NPM package specification (e.g., @openimis/fe-core@1.0.0)
 * @returns {string|null} Version string or null if no version found or spec is a file reference
 */
function getNpmVersion(npmSpec) {
  if (!npmSpec || typeof npmSpec !== "string") {
    return null;
  }

  const spec = npmSpec.trim();
  if (!spec) return null;

  if (
    spec.startsWith("file:") ||
    spec.startsWith("git+") ||
    spec.startsWith("git://") ||
    spec.startsWith("ssh://") ||
    spec.startsWith("http://") ||
    spec.startsWith("https://") ||
    spec.startsWith("workspace:") ||
    spec.startsWith("link:")
  ) {
    return null;
  }

  if (spec.includes("#")) {
    return null;
  }

  if (spec.startsWith("@")) {
    const match = spec.match(/^@[^/]+\/[^@]+@(.+)$/);
    return match ? match[1] : null;
  }

  const plainMatch = spec.match(/^[^@]+@(.+)$/);
  if (plainMatch) {
    return plainMatch[1];
  }

  if (/^[~^<>=*]/.test(spec) || /^\d/.test(spec)) {
    return spec;
  }

  return null;
}

/**
 * Determine the logical name for a module used in configuration lookups.
 * Extracts from logicalName field, npm spec path, or defaults to module.name.
 * 
 * @param {object} module - Module configuration object
 * @returns {string} Logical name for the module
 */
function getModuleLogicalName(module) {
  if (module.logicalName) {
    return module.logicalName;
  }

  if (module.npm) {
    const match = module.npm.match(/([^/]*)\/([^@/]+)(?:@.*)?$/);
    if (match) {
      return match[2];
    }
  }

  return module.name;
}

/**
 * Normalize a file: URL reference into a usable local filesystem path.
 * Handles docker-style paths (file:/./path) and converts them to relative paths for local dev.
 * 
 * @param {string} npmSpec - NPM spec that may start with file:
 * @returns {string|null} Normalized local path or original spec if not a file reference
 */
function getLocalPathFromNpmSpec(npmSpec) {
  if (!npmSpec || !npmSpec.startsWith("file:")) {
    return npmSpec;
  }

  const rawPath = npmSpec.slice("file:".length);
  if (rawPath.startsWith("/./")) {
    return path.posix.normalize(`../${rawPath.slice(3)}`);
  }

  if (rawPath.startsWith("./")) {
    return path.posix.normalize(rawPath);
  }

  if (rawPath.startsWith("/../")) {
    return path.posix.normalize(`..${rawPath.slice(3)}`);
  }

  if (rawPath.startsWith("/")) {
    return path.posix.normalize(rawPath.slice(1));
  }

  return path.posix.normalize(rawPath);
}

/**
 * Extract GitHub repository name from an npm package specification.
 * Parses git URLs and @openimis scoped package names.
 * 
 * @param {string} npmStr - NPM specification or git URL
 * @returns {string|null} Repository name in format owner/repo or null if not parseable
 */
function parseNpmGitRepoName(npmStr) {
  if (!npmStr || typeof npmStr !== "string") {
    return null;
  }

  const githubMatch = npmStr.match(/github\.com\/(.+?)(?:\.git)?(?:#.*)?$/);
  if (githubMatch) {
    return githubMatch[1];
  }

  const npmMatch = npmStr.match(/@openimis\/(.+?)(?:@.+)?$/);
  if (npmMatch) {
    return `openimis/openimis-${npmMatch[1]}_js`;
  }

  return null;
}

/**
 * Extract git branch name from an npm package specification.
 * Looks for #branchname suffix in npm git URLs.
 * 
 * @param {string} npmStr - NPM specification or git URL
 * @returns {string|null} Branch name or null if no branch specified
 */
function parseNpmBranch(npmStr) {
  if (!npmStr || typeof npmStr !== "string") {
    return null;
  }

  const hashIndex = npmStr.indexOf("#");
  if (hashIndex === -1) return null;
  const branch = npmStr.slice(hashIndex + 1).trim();
  return branch || null;
}

/**
 * Extract and normalize all relevant module metadata from a module config object.
 * Combines parsing of npm spec, git info, and path handling into a single object.
 * 
 * @param {object} module - Module configuration object with npm and name properties
 * @returns {object} Module info object with name, npm, path, gitName, repoUrl, branch, packageName
 */
function extractModuleInfo(module) {
  if (!module || typeof module !== "object") {
    throw new Error("Invalid module entry: expected object");
  }
  const modulePath = getLocalPathFromNpmSpec(module.npm) || module.name;

  return {
    name: module.name,
    npm: module.npm,
    path: modulePath,
    gitName: parseNpmGitRepoName(module.npm),
    repoUrl: `https://github.com/openimis/${module.name}.git`,
    branch: parseNpmBranch(module.npm),
    packageName: parseNpmPackageName(module),
  };
}

function validateConfig(config) {
  const errors = [];
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Invalid config: expected a JSON object");
  }

  if (!Array.isArray(config.modules)) {
    errors.push("config.modules must be an array");
  } else {
    config.modules.forEach((mod, idx) => {
      if (!mod || typeof mod !== "object") {
        errors.push(`config.modules[${idx}] must be an object`);
        return;
      }
      if (!mod.name || typeof mod.name !== "string") {
        errors.push(`config.modules[${idx}].name must be a non-empty string`);
      }
      if (!mod.npm || typeof mod.npm !== "string") {
        errors.push(`config.modules[${idx}].npm must be a non-empty string`);
      }
      if (mod.logicalName && typeof mod.logicalName !== "string") {
        errors.push(`config.modules[${idx}].logicalName must be a string when provided`);
      }
    });
  }

  if (config.locales !== undefined) {
    if (!Array.isArray(config.locales)) {
      errors.push("config.locales must be an array when provided");
    } else {
      config.locales.forEach((lc, idx) => {
        if (!lc || typeof lc !== "object") {
          errors.push(`config.locales[${idx}] must be an object`);
          return;
        }
        if (!lc.intl || typeof lc.intl !== "string") {
          errors.push(`config.locales[${idx}].intl must be a non-empty string`);
        }
        if (lc.languages && !Array.isArray(lc.languages)) {
          errors.push(`config.locales[${idx}].languages must be an array when provided`);
        }
      });
    }
  }

  if (errors.length) {
    throw new Error(`Configuration validation failed:\n- ${errors.join("\n- ")}`);
  }

  return true;
}

function isDryRun(args = []) {
  return (args || []).includes("--dry-run");
}

function safeWriteJson(filePath, value, options = {}) {
  if (options.dryRun) {
    console.log(`[dry-run] would write JSON file: ${filePath}`);
    return;
  }

  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const stamp = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const tempPath = path.join(dir, `.${base}.${stamp}.tmp`);
  const backupPath = path.join(dir, `.${base}.${stamp}.bak`);

  const payload = JSON.stringify(value, null, 2);

  try {
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    fs.writeFileSync(tempPath, payload, { encoding: "utf8", flag: "w" });
    fs.renameSync(tempPath, filePath);

    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  } catch (error) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    if (fs.existsSync(backupPath)) {
      try { fs.copyFileSync(backupPath, filePath); } catch (_) {}
      try { fs.unlinkSync(backupPath); } catch (_) {}
    }
    throw error;
  }
}

module.exports = {
  loadConfig,
  processLocales,
  generateModulesJs,
  parseNpmPackageName,
  getNpmVersion,
  getModuleLogicalName,
  getLocalPathFromNpmSpec,
  parseNpmGitRepoName,
  parseNpmBranch,
  extractModuleInfo,
  validateConfig,
  isDryRun,
  safeWriteJson,
};
