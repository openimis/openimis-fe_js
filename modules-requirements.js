const fs = require('fs');

fs.readFile('./openimis.json', 'utf8', function read(err, data) {
    if (err) throw err;
    config = JSON.parse(data);

    var srcModules = fs.createWriteStream('./src/modules.js');
    var modulesInstalls = fs.createWriteStream('./modules-installs.txt');

    config['modules'].forEach((module) => {        
        let lib = module.npm.substring(0, module.npm.lastIndexOf('@'));
        srcModules.write(`import ${module.name} from '${lib}';\n`);
        modulesInstalls.write("yarn add " + module.npm + "\n");
    })

    srcModules.write("\nexport default [\n")
    srcModules.write(config['modules'].map((module) => module.name).join(",\n"));
    srcModules.write("];");   
    srcModules.end();
    modulesInstalls.end();
});