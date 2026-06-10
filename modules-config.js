const fs = require("fs");
const pkg = require("./package.json");
const {
  loadConfig,
  processLocales,
  generateModulesJs,
  parseNpmPackageName,
  getNpmVersion,
  getModuleLogicalName,
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

  // Get openIMIS configuration from args
  console.log("Load configuration");
  const config = loadConfig(process.argv.slice(2));

  console.log("Process Locales");
  processLocales(config);

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
  generateModulesJs(modules);

  console.log("Save package.json");
  fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 2), { encoding: "utf-8", flag: "w" });
}

main();
