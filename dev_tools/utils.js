const fs = require("fs");
const path = require("path");

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
  if (args && args.length > 0) {
    const configPath = path.resolve(cwd, args[0]);
    console.log(`  load configuration from '${args[0]}'`);
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
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, { encoding: "utf8", flag: "w" });
}

/**
 * Process locale configuration and generate locales.js for React Intl.
 * Creates exports for locale list, file name mappings, and language-to-locale mapping.
 * 
 * @param {object} config - Configuration object containing locales array
 * @param {string} outputPath - Path where locales.js should be written (default: ./src/locales.js)
 */
function processLocales(config, outputPath = "./src/locales.js") {
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

  writeFile(outputPath, content);
}

/**
 * Generate modules.js that exports a list of packages and a loadModules function.
 * The generated file is used by the frontend assembly to dynamically require and initialize modules.
 * 
 * @param {object[]} modules - Array of module objects with moduleName, name, logicalName properties
 * @param {string} outputPath - Path where modules.js should be written (default: ./src/modules.js)
 */
function generateModulesJs(modules, outputPath = "./src/modules.js") {
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

  writeFile(outputPath, content.trimStart());
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

  if (npmSpec.startsWith("file:")) {
    return null;
  }

  const at = npmSpec.lastIndexOf("@");
  if (at > 0) {
    return npmSpec.substring(at + 1);
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

  const branchMatch = npmStr.match(/#(.+)$/);
  return branchMatch ? branchMatch[1] : null;
}

/**
 * Extract and normalize all relevant module metadata from a module config object.
 * Combines parsing of npm spec, git info, and path handling into a single object.
 * 
 * @param {object} module - Module configuration object with npm and name properties
 * @returns {object} Module info object with name, npm, path, gitName, repoUrl, branch, packageName
 */
function extractModuleInfo(module) {
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
};
