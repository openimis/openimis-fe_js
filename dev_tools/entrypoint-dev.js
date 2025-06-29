const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const yargs = require("yargs");
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
  return null; // Fallback if no match
}

function parseNpmName(module) {

  const npmMatch = module.npm.match(/(@openimis\/.+)@?/);
  if (npmMatch) {
    return npmMatch[1];
  }
  return "@openimis/fe-" +module.name.replace("Module", "").toLowerCase(); // Fallback if no match
}
function parseNpmBranch(npmStr) {
  const gitMatch = npmStr.match(/github\.com\.+#(.+)/);
  if (gitMatch) {
    return gitMatch[1];
  }

  return null; // Fallback if no match
}
function extractModuleInfo(module){
  const modulePath = module.npm.match(/^file:/) ? module.npm.replace(/^file:/, ''): module.name;
    return {
      "name": module.name,
      "npm": module.npm,
      "path": modulePath,
      "gitName" : parseNpm(module.npm),
      "repoUrl" : `https://github.com/openimis/${module.name}.git`,
      "branch" : parseNpmBranch(module.npm),
      "packageName": parseNpmName(module)
    };
}

function installAndLinkModules(imisJsonPath, modulesInstallPath) {
  let imisJSON;
  try {
    imisJSON = JSON.parse(fs.readFileSync(imisJsonPath, "utf8"));
  } catch (error) {
    console.error(`Error reading openimis.json at ${imisJsonPath}: ${error.message}`);
    throw error;
  }
  const curPath = String(shell.pwd())

  imisJSON.modules.forEach((module) => {
    let info = extractModuleInfo(module)
    const branch = info.branch || 'develop'
    if (!shell.test("-d", info.path)) {
      console.log(`Module directory ${info.path} does not exist. Cloning from ${info.repoUrl}...`);
      shell.cd(modulesInstallPath);
      try {
        shell.exec(`git clone ${info.repoUrl} ${info.path}`, { silent: true });
        console.log(`Successfully cloned ${info.name}`);
      } catch (error) {
        console.error(`Failed to clone ${info.name} from ${info.repoUrl}: ${error.message}`);
        throw error;
      }
    } else {
      console.log(`Module directory ${info.path} exists.`);
    }
    
    shell.cd(info.path);
    try {
      console.log(`Attempting to checkout and pull ${branch} for ${info.name}...`);
      shell.exec(`git checkout ${branch}`, { silent: true });
      shell.exec(`git pull`, { silent: true });
      console.log(`Successfully checked out and pulled ${branch} for ${info.name}`);
    } catch (error) {
      console.warn(`Skipping git checkout/pull for ${info.name} due to local changes or error: ${error.message}`);
    }
    //const npmPackageName = extractNpmPackageName('package.json')
    const modulePath = path.join(curPath,info.path);
    prepareModuleForLocalDevelopment(modulePath, info.name, info.packageName, path.dirname(imisJsonPath));
    shell.cd(curPath)
  });

  updatePackageInAssembly(imisJSON.modules, path.dirname(imisJsonPath), modulesInstallPath);
}

function prepareModuleForLocalDevelopment(modulePath, moduleName, npmPackageName, basePath) {
  shell.cd(modulePath);
  console.log(`Preparing ${moduleName} for local development...`);

  shell.exec(`npm unlink ${npmPackageName}`, { silent: true });
  shell.exec("npm install --include dev");
  //shell.exec("npm build");
  shell.exec("npm link");

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
    throw error;
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
    let info = extractModuleInfo(module)
    if (packageJSON.dependencies[info.packageName] !== `file:${info.path}`) {
      console.log(`Updating ${info.name} in package.json to use local path: file:${info.path}`);
      shell.exec(`npm remove ${info.packageName}`, { silent: true });
      packageJSON.dependencies[info.packageName] = `file:${info.path}`;
    } else {
      console.log(`${info.packageName} already linked to file:${info.path}`);
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

  modules.forEach((module) => {
    const npmPackageName = parseNpmName(module);
    console.log(`Linking ${npmPackageName}`);
    shell.exec(`npm link "${npmPackageName}"`, { silent: true });
  });
}


function main(configPath, modulesPath) {
  const imisJsonPath = path.resolve(configPath);
  const modulesInstallPath = path.resolve(modulesPath);
  //try {
    installAndLinkModules(imisJsonPath, modulesInstallPath);
  // } catch (error) {
  //   console.error(`Entrypoint failed: ${error}`);
  //   process.exit(1);
  // }
}

if (require.main === module) {
  const argv = yargs
    .option("config", {
      alias: "c",
      description: "Path to openimis.json",
      type: "string",
      default: path.join(__dirname, "..", "openimis.json"),
    })
    .option("path", {
      alias: "p",
      description: "Path to modules installation directory",
      type: "string",
      default: "../frontend-packages",
    })
    .help()
    .alias("help", "h")
    .argv;
  console.log("dev entrypoint, p: "+argv.path+", c: "+argv.config)
  main(argv.config, argv.path);
}

module.exports = {
  installAndLinkModules,
  prepareModuleForLocalDevelopment,
  updateModuleInAssembly,
  updatePackageInAssembly,
  main,
};