import { modules, versions } from "./modules";
import pkg from "../package.json";

class ModulesManager {

  constructor(cfg) {
    this.modules = modules(cfg);
    this.contributionsCache = {};
    this.componentsCache = null;
  }

  getOpenIMISVersion() {
    return pkg.version;
  }

  getModulesVersions() {
    return versions;
  }

  getComponent(key) {
    if (!this.componentsCache) {
      this.componentsCache = this.getContributions("components")
        .reduce((comps, comp) => {
          comps[comp.key] = comp.component;
          return comps
        }, {});
    }
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
