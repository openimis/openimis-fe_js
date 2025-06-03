const fs = require("fs");
const shell = require("shelljs");
const scriptPath = shell.cd(__dirname);
const path = require("path");
const { argv } = require("process");
const { has } = require("lodash");
const myArgs = process.argv.slice(2);
const moduleRepoUrl = myArgs[0];
const modulePath = myArgs[1];
const moduleName = myArgs[2];
const branch = myArgs[3];
const splitedModuleName = modulePath.split("openimis-")[1].split("_js")[0];
const separatedName = splitedModuleName.split("-")[1];

function dowloadModule(moduleRepoUrl,modulePath,moduleName, branch) {
  shell.cd(__dirname);
  shell.cd("..");
  shell.cd("..");
  
  // Check if the repository directory already exists
  if (shell.test("-d", modulePath)) {
    console.log(`Repository ${modulePath} already exists, pulling latest changes...`);
    shell.cd(modulePath);
    shell.exec(`git checkout ${branch}`);
    shell.exec("git pull");
  } else {
    console.log(`Cloning repository ${moduleName} in ${modulePath}..`);
    shell.exec(`git clone ${moduleRepoUrl}`);
    shell.cd(modulePath);
    shell.exec(`git checkout ${branch}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
  }
  
  let packageVersion = prepareModuleForLocalDevelopment(modulePath);
  updateModuleInAssembly(packageVersion, modulePath, moduleName);
}

function prepareModuleForLocalDevelopment(modulePath) {
  shell.cd(__dirname);
  shell.cd("..");
  shell.cd("..");
  shell.cd(modulePath);
  shell.exec("yarn unlink");
  shell.exec("yarn install");
  shell.exec("yarn build");
  shell.exec("yarn link");
  let module_path = shell.pwd();
  var pjson = require(path.join(module_path.stdout, "package.json"));
  return pjson.version;
}

function updateModuleInAssembly(packageVersion, modulePath, moduleName) {
  const imisJsonPath = path.normalize(path.join(__dirname, ".."));
  fs.readFile(path.join(imisJsonPath, "openimis.json"), "utf8", (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    const imisJSON = JSON.parse(data);
    const moduleExists = imisJSON["modules"].some((module) => module.name.toLowerCase() === moduleName);
    if (!moduleExists) {
      imisJSON["modules"].push({
        "name": moduleName,
        "npm": "@openimis/" + splitedModuleName + "@" + packageVersion,
      });
    }
    imisJSON["modules"] = imisJSON["modules"].filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj.name.toLowerCase()).indexOf(obj.name.toLowerCase()) === pos;
    });
    fs.writeFileSync(path.join(imisJsonPath, "openimis.json"), JSON.stringify(imisJSON, null, 2), {
      encoding: "utf8",
      flag: "w",
    });
    console.log("openimis.json is updated");
    updatePackageInAssembly();
  });
}

function updatePackageInAssembly() {
  shell.cd(__dirname);
  shell.cd("..");

  let imisPackagePath = path.normalize(path.join(__dirname, ".."));
  fs.readFile(path.join(imisPackagePath, "package.json"), "utf8", (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    let imisPackageJSON = JSON.parse(data);
    if (("@openimis/" + splitedModuleName in imisPackageJSON["dependencies"]) && imisPackageJSON["dependencies"]["@openimis/" + splitedModuleName] === ("file:../" + moduleName)) {
      console.log('module already installed');
    } else {
      imisPackageJSON["dependencies"]["@openimis/" + splitedModuleName] = "file:../" + moduleName;
       console.log("uninstall external module");
       shell.exec("yarn remove @openimis/" + splitedModuleName, (error, data) => {
        if (error) {
          console.log(error);
        }
        
      });
      fs.writeFileSync(path.join(imisPackagePath, "package.json"), JSON.stringify(imisPackageJSON, null, 2), {
        encoding: "utf8",
        flag: "w",
      });
      console.log("package.json is updated");

      console.log("linking module");
      //do last step to install app assembly again
      shell.exec("yarn link " + '"@openimis/' + splitedModuleName + '"');
    }
  });
}



function camalize(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function titleCase(string) {
  return string[0].toUpperCase() + string.slice(1);
}



dowloadModule(moduleRepoUrl, modulePath, moduleName, branch);