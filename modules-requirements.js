const fs = require('fs');

fs.readFile('./openimis.json', 'utf8', function read(err, data) {
    if (err) throw err;
    config = JSON.parse(data);

    var srcModules = fs.createWriteStream('./src/modules.js');
    var modulesInstalls = fs.createWriteStream('./modules-installs.txt');
    var modulesRemoves = fs.createWriteStream('./modules-removes.txt');
    var modulesLinks = fs.createWriteStream('./modules-links.txt');
    var modulesUnlinks = fs.createWriteStream('./modules-unlinks.txt');

    config['modules'].forEach((module) => {        
        let lib = module.npm.substring(0, module.npm.lastIndexOf('@'));
        srcModules.write(`import { ${module.name} } from '${lib}';\n`);        
        modulesInstalls.write(`yarn add ${module.npm}\n`);
        modulesRemoves.write(`yarn remove ${lib}\n`);
        modulesLinks.write(`yarn link ${lib}\n`);
        modulesUnlinks.write(`yarn unlink ${lib}\n`);
    })

    srcModules.write("\nexport default [\n")
    srcModules.write(config['modules'].map((module) => module.name).join(",\n"));
    srcModules.write("];");   
    srcModules.end();
    modulesInstalls.end();
});