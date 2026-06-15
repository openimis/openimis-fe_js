const fs = require("fs");
const shell = require("shelljs");
const path = require("path");
const yargs = require("yargs/yargs")(process.argv.slice(2)); // Modern yargs API

// Function to get the latest modification time of all files in a directory
function getLatestMtime(dir) {
  let latestMtime = 0;
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        const subMtime = getLatestMtime(fullPath); // Recurse into subdirectories
        latestMtime = Math.max(latestMtime, subMtime);
      } else {
        const stats = fs.statSync(fullPath);
        latestMtime = Math.max(latestMtime, stats.mtimeMs);
      }
    }
  } catch (err) {
    // If dir doesn't exist, return 0 (e.g., no src/)
    if (err.code === 'ENOENT') return 0;
    throw err;
  }
  return latestMtime;
}

// Function to get the earliest modification time of all files in a directory
function getEarliestMtime(dir) {
  let earliestMtime = Infinity;
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    if (files.length === 0) return Infinity; // No files in dist/, force build
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        const subMtime = getEarliestMtime(fullPath); // Recurse into subdirectories
        earliestMtime = Math.min(earliestMtime, subMtime);
      } else {
        const stats = fs.statSync(fullPath);
        earliestMtime = Math.min(earliestMtime, stats.mtimeMs);
      }
    }
  } catch (err) {
    // If dist/ doesn't exist, force build
    if (err.code === 'ENOENT') return Infinity;
    throw err;
  }
  return earliestMtime;
}

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
  const npmMatch = module.npm.match(/(@?[^@]+)(?:@.+)$/);
  if (npmMatch) {
    return npmMatch[1];
  }
  return "@openimis/fe-" + module.name.replace("Module", "").toLowerCase(); // Fallback if no match
}

function parseNpmBranch(npmStr) {
  const gitMatch = npmStr.match(/.+#(.+)/);
  if (gitMatch) {
    return gitMatch[1];
  }
  return null; // Fallback if no match
}

function extractModuleInfo(module, modulesInstallPath, branchOverride) {
  const local = module.npm.match(/^.*file:/)
  const github = module.npm.match(/github\.com/)
  let modulePath, packageName, repoUrl, branch;

  if(local){
    modulePath = path.join(modulesInstallPath, module.name);
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(path.join(modulePath, "package.json"), "utf-8"));
    } catch (error) {
      console.error(`Error reading package.json: ${error.message}`);
      process.exit(1);
    } finally {
      packageName = pkg.name;
      branch = null;
      repoUrl = pkg.repository;
    }
  } else {
    modulePath = path.join(modulesInstallPath, module.name);
    packageName = parseNpmName(module);
    branch = parseNpmBranch(module.npm);

    const gitUrlMatch = module.npm.match(/@(https?:\/\/github\.com\/.+?)(?:#.+)?$/);
    if (gitUrlMatch) {
      repoUrl = gitUrlMatch[1];
    } else {
      repoUrl = module.npm.replace(/#.+$/,"");
    }
  }

  console.log(`Path for ${modulePath}`);
  return {
    name: module.name,
    npm: module.npm,
    path: modulePath,
    repoUrl: repoUrl,
    branch: branch,
    packageName:packageName,
    local: local,
    github: github
  };
}

function installAndLinkModules(imisJsonPath, modulesInstallPath, branch) {
  let imisJSON;
  try {
    imisJSON = JSON.parse(fs.readFileSync(imisJsonPath, "utf8"));
  } catch (error) {
    console.error(`Error reading openimis.json at ${imisJsonPath}: ${error.message}`);
    throw error;
  }

  const curPath = String(shell.pwd());
  imisJSON.modules.forEach((module) => {
    let info = extractModuleInfo(module, modulesInstallPath, null);

    if (info.github) {
      // Handle GitHub module: skip cloning, let openimis-config-vite.js handle package.json
      console.log(`GitHub module ${info.name} detected - skipping local setup, will be handled by openimis-config-vite.js`);
    } else {
      // Handle local/file modules: clone and prepare
      const branch = info.branch;
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
      if (branch !== null){
        try {
          console.log(`Attempting to checkout and pull ${branch} for ${info.name}...`);
          shell.exec(`git checkout ${branch}`, { silent: true });
          shell.exec(`git pull`, { silent: true });
          console.log(`Successfully checked out and pulled ${branch} for ${info.name}`);
        } catch (error) {
          console.warn(`Skipping git checkout/pull for ${info.name} due to local changes or error: ${error.message}`);
        }
      }

      prepareModuleForLocalDevelopment(info.path, info.name, info.packageName);
      shell.cd(curPath);
    }
  });
  //updatePackageInAssembly(imisJSON.modules, path.dirname(imisJsonPath), modulesInstallPath);
  generateViteConfig(imisJSON.modules, modulesInstallPath);

}

function  prepareModuleForLocalDevelopment(modulePath, moduleName, npmPackageName) {
  shell.cd(modulePath);
  console.log(`Preparing ${moduleName} for local development...`);
  shell.exec("rm -rf node_modules");
  shell.exec("rm -f package-lock.json");
  const srcDir = path.join(modulePath, 'src');
  const distDir = path.join(modulePath, 'dist');
  // Check modiication times
  const srcMtime =  getLatestMtime(srcDir);
  const distMtime =  getEarliestMtime(distDir);
  
  const installResult = shell.exec("npm install --include=dev --ignore-scripts --legacy-peer-deps", { silent: false });
  if (installResult.code !== 0) {
    console.error(`npm install failed for ${moduleName}: ${installResult.stderr}`);
    throw new Error(`npm install failed for ${moduleName}`);
  }
  //const buildResult = shell.exec("npx vite build", { silent: false });
  // if (buildResult.code !== 0) {
  //   console.error(`vite build failed for ${moduleName}: ${buildResult.stderr}`);
  //   throw new Error(`vite build failed for ${moduleName}`);
  // }
  // if (distMtime === Infinity || srcMtime > distMtime) {
  //   shell.exec("npm run build");
  // }
  // shell.exec("npm link");

  const modulePackageJson = path.join("package.json");
  let packageVersion;
  try {
    packageVersion = JSON.parse(fs.readFileSync(modulePackageJson, "utf8")).version;
  } catch (error) {
    console.error(`Error reading ${moduleName}/package.json: ${error.message}`);
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
    let info = extractModuleInfo(module, modulesInstallPath, null);
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

  // modules.forEach((module) => {
  //   const npmPackageName = parseNpmName(module);
  //   console.log(`Linking ${npmPackageName}`);
  //   shell.exec(`npm link "${npmPackageName}"`);
  // });
}

function generateViteConfig(modules, modulesInstallPath) {
  console.log("Updating vite.config.js...");
  const viteConfigPath = "./vite.config.js";
  let viteConfigContent;

  // Read existing vite.config.js
  try {
    if (fs.existsSync(viteConfigPath)) {
      viteConfigContent = fs.readFileSync(viteConfigPath, "utf-8");
    } else {
      console.error("vite.config.js not found. Please ensure it exists with <<DYNAMIC_ALIAS_PLACEHOLDER>>.");
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error reading vite.config.js: ${error.message}`);
    process.exit(1);
  }

  // Step 1: Remove all lines containing //DYNAMIC_ALIAS,
  const lines = viteConfigContent.split('\n');
  const cleanedLines = lines.filter(line => !line.includes('//DYNAMIC_ALIAS,'));
  viteConfigContent = cleanedLines.join('\n');

  // Step 2: Find //<<DYNAMIC_ALIAS_PLACEHOLDER>>
  const placeholder = '//<<DYNAMIC_ALIAS_PLACEHOLDER>>';
  const placeholderIndex = viteConfigContent.indexOf(placeholder);
  if (placeholderIndex === -1) {
    console.error("Placeholder not found in vite.config.js.");
    process.exit(1);
  }

  // Step 3: Inject new aliases on the line(s) after the placeholder
  const localModules = modules.filter((module) => !module.npm.match(/github\.com/));
  if (localModules.length > 0) {
    const aliases = localModules.map((module) => {
      const info = extractModuleInfo(module, modulesInstallPath, null);
      const modulePath = path.resolve(info.path).replace(/\\/g, "/");
      return `      "${info.packageName}": path.resolve('${modulePath}','src'), //DYNAMIC_ALIAS,`;
    }).join('\n');

    const endOfPlaceholderLine = viteConfigContent.indexOf('\n', placeholderIndex);
    viteConfigContent =
      viteConfigContent.substring(0, endOfPlaceholderLine + 1) +
      aliases + '\n' +
      viteConfigContent.substring(endOfPlaceholderLine + 1);
  }

  // Write updated vite.config.js
  try {
    fs.writeFileSync(viteConfigPath, viteConfigContent, {
      encoding: "utf-8",
      flag: "w",
    });
    console.log("Updated vite.config.js with aliases for local modules");
  } catch (error) {
    console.error(`Error writing vite.config.js: ${error.message}`);
    process.exit(1);
  }
}

function main(configPath, modulesPath) {
  const imisJsonPath = path.resolve(configPath);
  const modulesInstallPath = path.resolve(modulesPath);

  console.log(`Setting local npm cache`);

  shell.exec(`npm config set cache ${path.join(modulesInstallPath, 'npm-cache')}`);

  //shell.exec(`find . -type d -iname node_modules -exec rm -rf {} \;)
  try {
    if (!fs.existsSync(imisJsonPath)) {
      throw new Error(`Configuration file ${imisJsonPath} does not exist`);
    }
    if (!fs.existsSync(modulesInstallPath)) {
      console.log(`Modules directory ${modulesInstallPath} does not exist, creating...`);
      fs.mkdirSync(modulesInstallPath, { recursive: true });
    }
    installAndLinkModules(imisJsonPath, modulesInstallPath);
  } catch (error) {
    console.error(`Entrypoint failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  const argv = yargs
    .option('config', {
      alias: 'c',
      description: 'Path to openimis.json',
      type: 'string',
      default: (() => {
        const devConfig = path.join(__dirname, '..', 'openimis-dev.json');
        const mainConfig = path.join(__dirname, '..', 'openimis.json');
        return fs.existsSync(devConfig) ? devConfig : mainConfig;
      })(),
    })
    .option('path', {
      alias: 'p',
      description: 'Path to modules installation directory',
      type: 'string',
      default: '../frontend-packages',
    })
    .option('host', {
      alias: 'H',
      description: 'Expose Vite server to network',
      type: 'boolean',
      default: false,
    })
    .help()
    .alias('help', 'h')

  console.log(`dev entrypoint, p: ${argv.path}, c: ${argv.config}, host: ${argv.host}`);
  main(argv.config, argv.path);
}

module.exports = {
  installAndLinkModules,
  prepareModuleForLocalDevelopment,
  updatePackageInAssembly,
  generateViteConfig,
  main,
};