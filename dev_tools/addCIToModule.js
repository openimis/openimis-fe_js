const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

const myArgs = process.argv.slice(2);
const moduleDirectory = myArgs[0];


function checkModuleExists(moduleDirectory){
    shell.cd(__dirname);
    shell.cd('..');
    shell.cd('..');
    imisFolder = shell.pwd();
    if (!fs.existsSync(path.join(imisFolder.stdout, path.join(moduleDirectory)))) {
        return false;
    }
    else{
        return true;
    }
}


function addFileToGithubWorflow(moduleDirectory){
    if(checkModuleExists(moduleDirectory)){
        shell.cd(__dirname);
        shell.cd('..');
        shell.cd('..');
        shell.cd(moduleDirectory);
        modulePath = shell.pwd();
        githubFolders = path.join('.github', 'workflows');
        fs.mkdir('.github', { recursive: true }, (err) => {
            if (err) throw err;
            fs.mkdir(path.join(modulePath.stdout, githubFolders), { recursive: true }, (err) => {
                if (err) throw err;
                copySkeletonCIFiles(modulePath, githubFolders);
            });
        });
    }
    else{
        console.log('Module '+moduleDirectory+' does not exist in local environment!')
    }
}


function copySkeletonCIFiles(modulePath, githubFolders){
    if (!fs.existsSync(path.join(modulePath.stdout, path.join(githubFolders, 'CI_and_build.yml')))) {
        skeletonFile = path.join(__dirname, path.join('skeletons', 'CI_and_build.yml'));
        fs.copyFile(skeletonFile, path.join(modulePath.stdout, path.join(githubFolders, 'CI_and_build.yml')), (err) => {
            if (err) throw err;
            console.log('CI_and_build.yml was copied!');
        });
    }
    else{
        console.log('CI_and_build.yml already exists!');
    }
    
    
    if (!fs.existsSync(path.join(modulePath.stdout, path.join(githubFolders, 'npmpublish.yml')))) {
        skeletonFile = path.join(__dirname, path.join('skeletons', 'npmpublish.yml'));
        fs.copyFile(skeletonFile, path.join(modulePath.stdout, path.join(githubFolders, 'npmpublish.yml')), (err) => {
            if (err) throw err;
            console.log('npmpublish.yml was copied!');
        });
    }
    else{
        console.log('npmpublish.yml already exists!');
    }
} 


addFileToGithubWorflow(moduleDirectory);
