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
    locales.write(`/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */`);
    locales.write(`\nexport default ${JSON.stringify(localeByLang)}`);
}

function getModuleLogicalName(module) {
  return module.logicalName || module.npm.match(/([^/]*)\/([^@]*).*/)[2];
}

function processModules(config, packageConfig) {
    var srcModules = fs.createWriteStream('./src/modules.js');
    config['modules'].forEach((module) => {
    let lib = module.npm.substring(0, module.npm.lastIndexOf('@'));
		let version = module.npm.substring( module.npm.lastIndexOf('@')+1);
    srcModules.write(`import { ${module.name} } from '${lib}';\n`);
    packageConfig.dependencies[lib] = version;
  });
  srcModules.write("\nexport const versions = [\n\t");
  srcModules.write(config["modules"].map((module) => `"${module.npm}"`).join(",\n\t"));
  srcModules.write("\n];\nexport const modules = (cfg) => [\n\t");
  srcModules.write(
    config["modules"]
      .map((module) => `${module.name}((cfg && cfg["${getModuleLogicalName(module)}"]) || {})`)
      .join(",\n\t")
  );
  srcModules.write("\n];");
  srcModules.end();
  return packageConfig;

}

function applyConfig(config, packageConfig) {
	processLocales(config);
	packageConfig = processModules(config, packageConfig);
}
// Configuration load 

function cleanDeps(packageConfig){
	for (const key in packageConfig.dependencies) {
		if (key.startsWith('@openimis')) delete packageConfig.dependencies[key];
	}
	return packageConfig;
}

fs.readFile('package.json', 'utf8', function read(err, data) {
	if (err) throw err;
	let packageConfig = cleanDeps(JSON.parse(data));
	try {
        if(!process.env.OPENIMIS_CONF_JSON)throw 'OPENIMIS_CONF_JSON not set !'; 
        JSON.parse(process.env.OPENIMIS_CONF_JSON);
		applyConfig(JSON.parse(process.env.OPENIMIS_CONF_JSON), packageConfig);
	} catch (e) {

        
		var configFile = process.argv[2];
		if (configFile === null || configFile === '' | configFile ===  undefined){
			configFile = './openimis.json';
		}
		console.log("Using file %s, Env variable OPENIMIS_CONF_JSON not valid: %s", configFile, process.env.OPENIMIS_CONF_JSON)
		fs.readFile(configFile, 'utf8', function read(err, data) {
			if (err) throw err;
			config = JSON.parse(data);
			applyConfig(config, packageConfig);
		});
	}
});
