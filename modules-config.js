const fs = require("fs");
const pkg = require("./package.json");

function processLocales(config) {
  var locales = fs.createWriteStream("./src/locales.js");
  let localeByLang = config["locales"].reduce((lcs, lc) => {
    lc.languages.forEach((lg) => (lcs[lg] = lc.intl));
    return lcs;
  }, {});
  let filesByLang = config["locales"].reduce((fls, lc) => {
    lc.languages.forEach((lg) => (fls[lg] = lc.fileNames));
    return fls;
  }, {});
  locales.write(`export const locales = ${JSON.stringify(config["locales"].map((lc) => lc.intl))}`);
  locales.write(`\nexport const fileNamesByLang = ${JSON.stringify(filesByLang)}`);
  locales.write(`/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */`);
  locales.write(`\nexport default ${JSON.stringify(localeByLang)}`);
}

function getConfig() {
  // Try to get the configuration from the args
  if (process.argv[2]) {
    console.log(`  load configuration from '${process.argv[2]}'`);
    return JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  } else if (process.env.OPENIMIS_CONF_JSON) {
    console.log(`  load configuration from env`);
    return JSON.parse(process.env.OPENIMIS_CONF_JSON);
  } else if (fs.existsSync("./openimis.json")) {
    console.log(`  load configuration from ./openimis.json`);
    return JSON.parse(fs.readFileSync("./openimis.json", "utf-8"));
  } else {
    throw new Error(
      "No configuration file found. Please provide a configuration in the CLI or in the OPENIMIS_CONF_JSON environment variable",
    );
  }
}

function processModules(modules) {
  const stream = fs.createWriteStream("./src/modules.js");

  stream.write(`
export const packages = [
  ${modules.map(({ moduleName }) => `"${moduleName}"`).join(",\n  ")}
];\n
`);

  stream.write(`
export function loadModules(cfg = {}) {
  const loadedModules = [];
${modules
.map(({ name, logicalName, moduleName }) => {
return `
  try {
    loadedModules.push(require("${moduleName}").${name ?? "default"}(cfg["${logicalName}"] || {}));
  } catch (error) {
    alert(\`Failed to load module "${moduleName}". More details can be found in the developer console. Look for: \${error}\`);
    console.error(error);
  }
`;
})
.join("")}
  return loadedModules;
}
`);

  stream.end();
}

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
  const config = getConfig();

  console.log("Process Locales");
  processLocales(config);

  console.log("Process Modules");
  const modules = [];
  for (const module of config.modules) {
    const { npm, name, logicalName } = module;
    // Find version number
    const moduleName = npm.substring(0, npm.lastIndexOf("@"));
    if (npm.lastIndexOf("@") <= 0) {
      throw new Error(`  Module ${moduleName} has no version set.`);
    }
    const version = npm.substring(npm.lastIndexOf("@") + 1);
    console.log(`  added "${moduleName}": ${version}`);
    pkg.dependencies[moduleName] = version;
    modules.push({
      moduleName,
      version,
      name,
      npm,
      logicalName: logicalName || npm.match(/([^/]*)\/([^@]*).*/)[2],
    });
  }
  processModules(modules);
}

main();
