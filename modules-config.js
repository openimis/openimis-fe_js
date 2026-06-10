const pkg = require("./package.json");
const {
  loadConfig,
  processLocales,
  generateModulesJs,
  parseNpmPackageName,
  getNpmVersion,
  getModuleLogicalName,
  validateConfig,
  isDryRun,
  safeWriteJson,
} = require("./dev_tools/utils");

function main() {
  /*
  Load openIMIS configuration. Configuration is taken from args if provided or from the environment variable
  */

  // Remove @openimis dependencies from package.json
  console.log("Remove @openimis dependencies from package.json");
  for (const key in pkg.dependencies) {
    if (key.startsWith("@openimis/")) {
      // This only covers modules made from the openIMIS organization
      console.log(`  removed ${key}`);
      delete pkg.dependencies[key];
    }
  }

  const args = process.argv.slice(2);
  const dryRun = isDryRun(args);

  // Get openIMIS configuration from args
  console.log("Load configuration");
  const config = loadConfig(args);
  validateConfig(config);

  console.log("Process Locales");
  processLocales(config, "./src/locales.js", { dryRun });

  console.log("Process Modules");
  const modules = [];
  for (const module of config.modules || []) {
    const { npm, name, logicalName } = module;
    const moduleName = parseNpmPackageName(module);
    const version = getNpmVersion(npm);
    if (!version && !npm?.startsWith("file:")) {
      throw new Error(`  Module ${moduleName} has no version set.`);
    }
    console.log(`  added "${moduleName}": ${version || npm}`);
    pkg.dependencies[moduleName] = npm?.startsWith("file:") ? npm : version;
    modules.push({
      moduleName,
      version,
      name,
      npm,
      logicalName: getModuleLogicalName(module),
    });
  }
  generateModulesJs(modules, "./src/modules.js", { dryRun });

  console.log("Save package.json");
  safeWriteJson("./package.json", pkg, { dryRun });
}

main();
