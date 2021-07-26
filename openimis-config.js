const fs = require('fs');

function processLocales(config) {
    var locales = fs.createWriteStream('./src/locales.js');
    let localeByLang = config['locales'].reduce(
        (lcs, lc) => {
            lc.languages.forEach((lg) => lcs[lg] = lc.intl);
            return lcs
        },
        {}
    );
    let filesByLang = config['locales'].reduce(
        (fls, lc) => {
            lc.languages.forEach((lg) => fls[lg] = lc.fileNames);
            return fls
        },
        {}
    );
    locales.write(`export const locales = ${JSON.stringify(config['locales'].map((lc) => lc.intl))}`);
    locales.write(`\nexport const fileNamesByLang = ${JSON.stringify(filesByLang)}`);
    locales.write(`\nexport default ${JSON.stringify(localeByLang)}`);
}

function processModules(config) {
    var srcModules = fs.createWriteStream('./src/modules.js');
    var modulesInstalls = fs.createWriteStream('./modules-installs.txt');
    var modulesRemoves = fs.createWriteStream('./modules-removes.txt');
    var modulesLinks = fs.createWriteStream('./modules-links.txt');
    var modulesUnlinks = fs.createWriteStream('./modules-unlinks.txt');

    modulesInstalls.write('yarn add')
    config['modules'].forEach((module) => {
        let lib = module.npm.substring(0, module.npm.lastIndexOf('@'));
        srcModules.write(`import { ${module.name} } from '${lib}';\n`);
        if(module.file !== null && module.file !== '' && module.file !==  undefined){
			modulesInstalls.write(` file:${module.file}`);
			modulesRemoves.write(`yarn remove ${lib}\n`);
			modulesLinks.write(`yarn link ${lib}\n`);
			modulesUnlinks.write(`yarn unlink ${lib}\n`);
		}else if(module.git !== null && module.git !== '' && module.git !==  undefined){
			modulesInstalls.write(` git+${module.git}`);
			modulesRemoves.write(`yarn remove ${lib}\n`);
		}else if(module.ssh !== null && module.ssh !== '' && module.ssh !==  undefined){
			modulesInstalls.write(` ssh:${module.ssh}`);
			modulesRemoves.write(`yarn remove ${lib}\n`);
		}else if(module.url !== null && module.url !== '' && module.url !==  undefined){
			modulesInstalls.write(` ${module.url}`);
			modulesRemoves.write(`yarn remove ${lib}\n`);
		}else{
			modulesInstalls.write(` ${module.npm}`);
		}
		
        
    });
    modulesInstalls.write('\n')
    srcModules.write("\nfunction logicalName(npmName) {\n\t");
    srcModules.write("return [...npmName.match(/([^/]*)\\/([^@]*).*/)][2];\n");
    srcModules.write("}\n");
    srcModules.write("\nexport const versions = [\n\t")
    srcModules.write(config['modules'].map((module) => `"${module.npm}"`).join(",\n\t"));
    srcModules.write("\n];\nexport const modules = (cfg) => [\n\t")
    srcModules.write(config['modules'].map((module) => `${module.name}((cfg && cfg[logicalName('${module.npm}')]) || {})`).join(",\n\t"));
    srcModules.write("\n];");
    srcModules.end();
    modulesInstalls.end();
}

function applyConfig(config) {
	processLocales(config);
    	processModules(config);
}
// Configuration load 


try {
JSON.parse(process.env.OPENIMIS_CONF_JSON);
} catch (e) {
	var configFile = process.argv[2];
	if (configFile === null || configFile === '' | configFile ===  undefined){
	    configFile = './openimis.json';
	}
	fs.readFile(configFile, 'utf8', function read(err, data) {
    		if (err) throw err;
    		config = JSON.parse(data);
		applyConfig(config);
	});
}
applyConfig(process.env.OPENIMIS_CONF_JSON)
	
