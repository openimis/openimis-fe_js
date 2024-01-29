const fs = require("fs");
const shell = require("shelljs");
const scriptPath = shell.cd(__dirname);
const path = require("path");
const { argv } = require("process");
const { has } = require("lodash");

const myArgs = process.argv.slice(2);
const moduleRepoUrl = myArgs[0];
const branch = myArgs[1];

const moduleName = moduleRepoUrl.split("/").pop().split(".")[0];
const splitedModuleName = moduleName.split("openimis-")[1].split("_js")[0];
const separatedName = splitedModuleName.split("-")[1];

function dowloadModule(moduleRepoUrl, branch) {
  shell.cd(__dirname);
  shell.cd("..");
  shell.cd("..");
  shell.exec("git clone " + moduleRepoUrl);

  console.log(moduleName);

  //checkout to chosen branch
  shell.cd(moduleName);
  shell.exec("git checkout " + branch, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    packageVersion = prepareModuleForLocalDevelopment(moduleName);
    updateModuleInAssembly(packageVersion);
  });
}

function prepareModuleForLocalDevelopment(moduleName) {
  shell.cd(moduleName);
  shell.exec("yarn unlink");
  shell.exec("yarn install");
  shell.exec("yarn build");
  shell.exec("yarn link");
  module_path = shell.pwd();
  var pjson = require(path.join(module_path.stdout, "package.json"));
  return pjson.version;
}

function updateModuleInAssembly(packageVersion) {
  const imisJsonPath = path.normalize(path.join(__dirname, ".."));
  fs.readFile(path.join(imisJsonPath, "openimis.json"), "utf8", (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    const imisJSON = JSON.parse(data);

    const newModuleName = titleCase(camalize(separatedName)).toLowerCase() + "module";

    const moduleExists = imisJSON["modules"].some((module) => module.name.toLowerCase() === newModuleName);

    if (!moduleExists) {
      imisJSON["modules"].push({
        "name": titleCase(camalize(separatedName)) + "Module",
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

    reinstallAssemblyModule();
  });
}

function updatePackageInAssembly() {
  imisPackagePath = path.normalize(path.join(__dirname, ".."));
  fs.readFile(path.join(imisPackagePath, "package.json"), "utf8", (error, data) => {
    if (error) {
      console.log(error);
      return;
    }
    imisPackageJSON = JSON.parse(data);

    if ("@openimis/" + splitedModuleName in imisPackageJSON["dependencies"]) {
      imisPackageJSON["dependencies"]["@openimis/" + splitedModuleName] = "file:../" + moduleName;
    } else {
      imisPackageJSON["dependencies"]["@openimis/" + splitedModuleName] = "file:../" + moduleName;
    }

    fs.writeFileSync(path.join(imisPackagePath, "package.json"), JSON.stringify(imisPackageJSON, null, 2), {
      encoding: "utf8",
      flag: "w",
    });
    console.log("package.json is updated");
    //do last step to install app assembly again
    shell.exec("yarn link " + '"@openimis/' + splitedModuleName + '"');
    shell.exec("yarn install");
    console.log("Application has been updated!");
  });
}

function reinstallAssemblyModule() {
  console.log("Link local module");
  shell.cd(__dirname);
  shell.cd("..");
  shell.exec("node modules-config.js");

  console.log("uninstall external module");
  shell.exec("yarn remove @openimis/" + splitedModuleName, (error, data) => {
    if (error) {
      console.log(error);
    }
    updatePackageInAssembly();
  });
}

function camalize(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function titleCase(string) {
  return string[0].toUpperCase() + string.slice(1);
}

dowloadModule(moduleRepoUrl, branch);
