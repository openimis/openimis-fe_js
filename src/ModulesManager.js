import { modules, versions } from "./modules";
import pkg from "../package.json";

class ModulesManager {

  constructor(cfg) {
    this.cfg = cfg;
    this.modules = modules(cfg);
    this.contributionsCache = {};
    this.controlsCache = this.buildControlsCache();
    this.componentsCache = this.buildComponentsCache();
  }

  buildControlsCache() {
    let ctrls = {};
    for (var k in this.cfg) {
      if (!!this.cfg[k].controls) {
        this.cfg[k].controls.forEach(c => ctrls[c['fieldName']] = c['usage']);
      }
    }
    return ctrls;
  }

  buildComponentsCache() {
    return this.getContributions("components")
      .reduce((comps, comp) => {
        comps[comp.key] = comp.component;
        return comps
      }, {});
  }

  getOpenIMISVersion() {
    return pkg.version;
  }

  getModulesVersions() {
    return versions;
  }

  skipControl(module, key) {
    return this.controlsCache['fe-'+module+"."+key] === "S";
  }

  getComponent(key) {
    return this.componentsCache[key];
  }

  getContributions(key) {
    if (this.contributionsCache[key]) {
      return this.contributionsCache[key];
    }
    let res = this.modules.reduce((contributions, module) => {
      const contribs = (module || {})[key];
      if (contribs) {
        contributions.push(...contribs);
      }
      return contributions;
    }, []);
    this.contributionsCache[key] = res;
    return res;
  }

  getConfiguration(module, key, defaultValue = null) {
    let moduleCfg = this.cfg[module] || {};
    return moduleCfg[key] !== undefined ? moduleCfg[key] : defaultValue;
  }
}

export default ModulesManager;
