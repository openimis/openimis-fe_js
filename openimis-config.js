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


function parseNpm(npmStr) {
  const gitMatch = npmStr.match(/github\.com[\/:](.+)\.git/);
  if (gitMatch) {
    return gitMatch[1];
  }
  const npmMatch = npmStr.match(/@openimis\/([^@]+)@/);
  if (npmMatch) {
    return `openimis/openimis-${npmMatch[1]}_js`;
  }
  return null;
}

function parseNpmName(module) {
  const npmMatch = module.npm.match(/(@openimis\/[^@]+)(?:@.+)?/);
  if (npmMatch) {
    return npmMatch[1];
  }
  return "@openimis/fe-" + module.name.replace("Module", "").toLowerCase();
}

function parseNpmBranch(npmStr) {
  const gitMatch = npmStr.match(/github\.com\.+#(.+)/);
  if (gitMatch) {
    return gitMatch[1];
  }
  return null;
}

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function extractModuleInfo(module) {
  const modulePath = module.npm.match(/^.+file:/) ? module.npm.replace(/^.+file:/, '') : module.name;
  return {
    "name": module.name,
    "npm": module.npm,
    "path": modulePath,
    "gitName": parseNpm(module.npm),
    "gitUrl": `https://github.com/openimis/${module.name}.git`,
    "branch": parseNpmBranch(module.npm),
    "packageName": parseNpmName(module)
  };
}

function getConfig() {
  // Try to get the configuration from the args
  if (process.argv[2]) {
    console.log(`  load configuration from '${process.argv[2]}'`);
    return JSON.parse(fs.readFileSync(process.argv[2], "utf-8"));
  } else if (process.env.OPENIMIS_CONF_JSON) {
    console.log(`  load configuration from env`);
    return JSON.parse(process.env.OPENIMIS_CONF_JSON);
  } else if (fs.existsSync("./openimis-dev.json")) {
      console.log(`  load configuration from ./openimis-dev.json`);
      return JSON.parse(fs.readFileSync("./openimis-dev.json", "utf-8"));
  } else if (fs.existsSync("./openimis.json")) {
    console.log(`  load configuration from ./openimis.json`);
    return JSON.parse(fs.readFileSync("./openimis.json", "utf-8"));
  } else {
    throw new Error(
      "No configuration file found. Please provide a configuration in the CLI or in the OPENIMIS_CONF_JSON environment variable",
    );
  }
}

function getModuleNameFromExport(path) {
  try {
    const indexPath = `${path}/src/index.js`;
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf-8');
      const match = content.match(/export\s+(?:default\s+)?(?:function\s+|const\s+|let\s+|var\s+)?(\w+)/);
      if (match) {
        return match[1];
      }
    }
  } catch (e) {
    // ignore
  }
  return 'default';
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
    loadedModules.push(require("${moduleName}").${name ?? "default"}(cfg["${moduleName}"] || {}));
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
    const { npm, name: exportName, logicalName } = module;

    // Parse npm string
    
    const parsed = extractModuleInfo(module);
    console.log(parsed)
    let moduleName = parsed.packageName;
    let version = parsed.localPath;
    let computedName = null;

    if (!version && parsed.gitUrl) {
      // compute local path
      let name = null;
      if (parsed.packageName) {
        name = parsed.packageName.split('/').pop().replace('fe-', '');
      } else {
        // fallback on package.json from git, but for now assume from url
        const repo = parsed.gitUrl.split('/').pop();
        name = repo.replace('openimis-fe-', '').replace('_js', '');
      }
      computedName = name;
      version = `file:../frontend-packages/${parsed.path}`;
      if (!moduleName) {
        moduleName = `@openimis/fe-${name}`;
      }
      version = `file:../frontend-packages/${moduleName}`;
    }

    if (!version) {
      version = parsed.localPath;
      if (!moduleName && parsed.localPath) {
        // get from local package.json
        const path = parsed.localPath.replace('file:', '');
        const pkgPath = `${path}/package.json`;
        if (fs.existsSync(pkgPath)) {
          const localPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          const name = localPkg.name.split('/').pop().replace('fe-', '');
          moduleName = localPkg.name;
          computedName = name;
        }
      }
    }

    if (moduleName && version) {
      console.log(`  added "${moduleName}": ${version}`);
      pkg.dependencies[moduleName] = version;
      const finalName = exportName || getModuleNameFromExport(version.replace('file:', '')) || 'default';
      modules.push({
        moduleName,
        version,
        name: finalName,
        npm,
        logicalName: logicalName || computedName || moduleName.split('/').pop(),
      });
    }
  }
  processModules(modules);
  console.log("Save package.json");
  fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 2), { encoding: "utf-8", flag: "w" });
}

main();
