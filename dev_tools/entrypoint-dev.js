const fs = require("fs");
const shell = require("shelljs");
const path = require("path");

function extractNpmPackageName(packageJsonPath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.name || null;
  } catch (error) {
    console.error(`Error reading package.json at ${packageJsonPath}: ${error.message}`);
    return null;
  }
}

function parseNpm(npmStr) {
  const gitMatch = npmStr.match(/github\.com\/(.+)\.git/);
  if (gitMatch) {
    return gitMatch[1];
  }
  const npmMatch = npmStr.match(/@openimis\/(.+)@/);
  if (npmMatch) {
    return `openimis/openimis-${npmMatch[1]}_js`;
  }
  return null;
}

function parseNpmName(module) {
  const npmMatch = module.npm.match(/(@openimis\/.+)@?/);
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

function extractModuleInfo(module) {
  const modulePath = module.npm.match(/^file:/) ? module.npm.replace(/^file:/, '') : module.name;
  return {
    "name": module.name,
    "npm": module.npm,
    "path": modulePath,
    "gitName": parseNpm(module.npm),
    "repoUrl": `https://github.com/openimis/${module.name}.git`,
    "branch": parseNpmBranch(module.npm),
    "packageName": parseNpmName(module)
  };
}

function isModuleLinkedGlobally(npmPackageName) {
  const result = shell.exec(`yarn ls -g --link ${npmPackageName}`, { silent: true });
  return result.code === 0 && result.stdout.includes(npmPackageName);
}

function isModuleLinkedLocally(npmPackageName, basePath) {
  const packageJsonPath = path.join(basePath, "package.json");
  try {
    const packageJSON = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJSON.dependencies && packageJSON.dependencies[npmPackageName]?.startsWith("file:");
  } catch (error) {
    console.error(`Error checking package.json for ${npmPackageName}: ${error.message}`);
    return false;
  }
}

function installAndLinkModules(imisJsonPath, modulesInstallPath) {
  let imisJSON;
  try {
    imisJSON = JSON.parse(fs.readFileSync(imisJsonPath, "utf8"));
  } catch (error) {
    console.error(`Error reading openimis.json at ${imisJsonPath}: ${error.message}`);
    throw error;
  }
  const curPath = String(shell.pwd());

  imisJSON.modules.forEach((module) => {
    let info = extractModuleInfo(module);
    const modulePath = path.isAbsolute(info.path) 
      ? info.path 
      : path.resolve(modulesInstallPath, info.path);
    
    if (!shell.test("-d", modulePath)) {
      console.log(`Module directory ${modulePath} does not exist. Cloning from ${info.repoUrl}...`);
      shell.cd(modulesInstallPath);
      try {
        shell.exec(`git clone ${info.repoUrl} ${modulePath}`, { silent: true });
        console.log(`Successfully cloned ${info.name}`);
      } catch (error) {
        console.error(`Failed to clone ${info.name} from ${info.repoUrl}: ${error.message}`);
        throw error;
      }
    } else {
      console.log(`Module directory ${modulePath} exists.`);
    }

    prepareModuleForLocalDevelopment(modulePath, info.name, info.packageName, path.dirname(imisJsonPath));
    shell.cd(curPath);
  });

  updatePackageInAssembly(imisJSON.modules, path.dirname(imisJsonPath), modulesInstallPath);
}

function prepareModuleForLocalDevelopment(modulePath, moduleName, npmPackageName, basePath) {
  shell.cd(modulePath);
  console.log(`Preparing ${moduleName} for local development...`);

  if (isModuleLinkedGlobally(npmPackageName)) {
    console.log(`${npmPackageName} is already globally linked, skipping npm unlink.`);
  } else {
    console.log(`Unlinking ${npmPackageName} if previously linked...`);
    shell.exec(`yarn unlink ${npmPackageName}`, { silent: true });
  }

  shell.exec("yarn install --legacy-peer-deps --include dev");
  // shell.exec("yarn run build"); // Commented out to avoid premature builds

  if (isModuleLinkedGlobally(npmPackageName)) {
    console.log(`${npmPackageName} is already globally linked, skipping npm link.`);
  } else {
    console.log(`Linking ${npmPackageName} globally...`);
    shell.exec("yarn link", { silent: true });
  }

  const modulePackageJson = path.join("package.json");
  let packageVersion;
  try {
    packageVersion = JSON.parse(fs.readFileSync(modulePackageJson, "utf8")).version;
  } catch (error) {
    console.error(`Error reading ${moduleName}/package.json: ${error.message}`);
    throw error;
  }

  updateModuleInAssembly(packageVersion, modulePath, moduleName, npmPackageName, basePath);
}

function updateModuleInAssembly(packageVersion, modulePath, moduleName, npmPackageName, basePath) {
  const imisJsonPath = path.join(basePath, "openimis.json");
  let imisJSON;

  try {
    imisJSON = JSON.parse(fs.readFileSync(imisJsonPath, "utf8"));
  } catch (error) {
    console.error(`Error reading openimis.json at ${imisJsonPath}: ${error.message}`);
    throw error;
  }

  const moduleExists = imisJSON.modules.some((m) => m.name.toLowerCase() === moduleName.toLowerCase());
  if (!moduleExists) {
    imisJSON.modules.push({
      name: moduleName,
      npm: `file:${modulePath}`,
    });
  } else {
    imisJSON.modules = imisJSON.modules.map((m) =>
      m.name.toLowerCase() === moduleName.toLowerCase()
        ? { ...m, npm: `file:${modulePath}` }
        : m
    );
  }

  imisJSON.modules = imisJSON.modules.filter(
    (obj, pos, arr) =>
      arr.map((mapObj) => mapObj.name.toLowerCase()).indexOf(obj.name.toLowerCase()) === pos
  );

  try {
    fs.writeFileSync(imisJsonPath, JSON.stringify(imisJSON, null, 2), {
      encoding: "utf8",
      flag: "w",
    });
    console.log(`Updated openimis.json for ${moduleName}`);
  } catch (error) {
    console.error(`Error writing openimis.json: ${error.message}`);
    
  }
}

function updatePackageInAssembly(modules, basePath, modulesInstallPath) {
  const packageJsonPath = path.join(basePath, "package.json");
  let packageJSON;

  try {
    packageJSON = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch (error) {
    console.error(`Error reading package.json at ${packageJsonPath}: ${error.message}`);
    throw error;
  }

  modules.forEach((module) => {
    let info = extractModuleInfo(module);
    const localModulePath = `file:${path.isAbsolute(info.path) ? info.path : path.resolve(modulesInstallPath, info.path)}`;
      
    if (packageJSON.dependencies[info.packageName] !== localModulePath) {
      console.log(`Updating ${info.name} in package.json to use local path: ${localModulePath}`);
      shell.exec(`yarn remove ${info.packageName}`, { silent: true });
      packageJSON.dependencies[info.packageName] = localModulePath;
    } else {
      console.log(`${info.packageName} already linked to ${localModulePath} in package.json`);
    }

    if (isModuleLinkedLocally(info.packageName, basePath)) {
      console.log(`${info.packageName} is already linked locally, skipping npm link.`);
    } else {
      console.log(`Linking ${info.packageName} in main project...`);
      shell.exec(`yarn link "${info.packageName}"`, { silent: true });
    }
  });

  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJSON, null, 2), {
      encoding: "utf8",
      flag: "w",
    });
    console.log("Updated package.json with local module paths");
  } catch (error) {
    console.error(`Error writing package.json: ${error.message}`);
    throw error;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    config: path.join(__dirname, "..", "openimis.json"),
    path: "../frontend-packages"
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-c" || args[i] === "--config") {
      if (i + 1 < args.length) {
        parsed.config = args[i + 1];
        i++;
      }
    } else if (args[i] === "-p" || args[i] === "--path") {
      if (i + 1 < args.length) {
        parsed.path = args[i + 1];
        i++;
      }
    }
  }

  console.log(`dev entrypoint, p: ${parsed.path}, c: ${parsed.config}`);
  return parsed;
}

function main() {
  const { config, path: modulesPath } = parseArgs();
  const imisJsonPath = path.resolve(config);
  const modulesInstallPath = path.resolve(modulesPath);
  installAndLinkModules(imisJsonPath, modulesInstallPath);
}

if (require.main === module) {
  main();
}

module.exports = {
  installAndLinkModules,
  prepareModuleForLocalDevelopment,
  updateModuleInAssembly,
  updatePackageInAssembly,
  main
};
