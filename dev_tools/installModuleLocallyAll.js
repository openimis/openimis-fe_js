const fs = require('fs');
const shell = require('shelljs');
const scriptPath = shell.cd(__dirname);
const path = require('path');
const { argv } = require('process');
const { has } = require('lodash');


function downloadModulesLocallyBasedOnImisJson(){
    let imisJsonPath = path.normalize(path.join(__dirname, '..'));
    fs.readFile(path.join(imisJsonPath, 'openimis.json'), 'utf8', (error, data) => {
        if(error){
           console.log(error);
           return;
        }
        let imisJSON = JSON.parse(data);
        imisJSON['modules'].forEach(module => {
            console.log(module["npm"]);
            let modulePath = module["npm"].split('/')[1]
            modulePath = "openimis-"+modulePath.split('@')[0]+"_js"
            let moduleRepoUrl = 'https://github.com/openimis/'+modulePath+'.git';
            shell.exec('node installModuleLocally.js '+moduleRepoUrl +' '+modulePath+' '+module["name"]+' develop');
        });

        shell.cd(__dirname);
        shell.cd('..');
        shell.exec("node modules-config.js");
        shell.exec("yarn install");
        console.log("Application has been updated!");
    })
}

downloadModulesLocallyBasedOnImisJson();
