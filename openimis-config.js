const fs = require("fs");
const path = require("path");
const pkg = require("./package.json");

function processLocales(config) {
  const locales = fs.createWriteStream("./src/locales.js");
  const localeByLang = config.locales.reduce((acc, lc) => {
    lc.languages.forEach((lg) => (acc[lg] = lc.intl));
    return acc;
  }, {});
  const filesByLang = config.locales.reduce((fls, lc) => {
    lc.languages.forEach((lg) => (fls[lg] = lc.fileNames));
    return fls;
  }, {});
  locales.write(`export const locales = ${JSON.stringify(config.locales.map((lc) => lc.intl))}`);
  locales.write(`\nexport const fileNamesByLang = ${JSON.stringify(filesByLang)}`);
  locales.write(`\nexport default ${JSON.stringify(localeByLang)}`);
}

function processModules(config, packageConfig) {
  const srcModules = fs.createWriteStream("./src/modules.js");
  config.modules.forEach((module) => {
    let lib = module.npm.substring(0, module.npm.lastIndexOf("@"));
    let version = module.npm.substring(module.npm.lastIndexOf("@") + 1);
    srcModules.write(`import { ${module.name} } from '${lib}';\n`);
    packageConfig.dependencies[lib] = version;
  });
  srcModules.write("\nfunction logicalName(npmName) {\n\t");
  srcModules.write("return [...npmName.match(/([^/]*)\\/([^@]*).*/)][2];\n");
  srcModules.write("}\n");
  srcModules.write("\nexport const versions = [\n\t");
  srcModules.write(config["modules"].map((module) => `"${module.npm}"`).join(",\n\t"));
  srcModules.write("\n];\nexport const modules = (cfg) => [\n\t");
  srcModules.write(
    config["modules"].map((module) => `${module.name}((cfg && cfg[logicalName('${module.npm}')]) || {})`).join(",\n\t")
  );
  srcModules.write("\n];");
  srcModules.end();
  return packageConfig;
}

function applyConfig(config, packageConfig) {
  processLocales(config);
  packageConfig = processModules(config, packageConfig);
  fs.writeFileSync("package.json", JSON.stringify(packageConfig, null, 2), { encoding: "utf8", flag: "w" });
}

function cleanDeps(packageConfig) {
  for (const key in packageConfig.dependencies) {
    if (key.startsWith("@openimis")) {
      delete packageConfig.dependencies[key];
    }
  }
  return packageConfig;
}

cleanDeps(pkg);

let config;
if (process.env.OPENIMIS_CONF_JSON) {
  console.log("Loading configuration from ENV");
  config = JSON.parse(process.env.OPENIMIS_CONF_JSON);
} else {
  const configPath = path.resolve(__dirname, process.argv[2] || "openimis.json");
  console.log(`Loading configuration from file ${configPath}`);
  config = require(configPath);
}

applyConfig(config, pkg);
