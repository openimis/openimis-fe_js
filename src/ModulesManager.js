import { modules, versions } from "./modules";
import pkg from "../package.json";

class ModulesManager {

  constructor(cfg) {
    this.cfg = cfg;
    this.modules = modules(cfg);
    this.contributionsCache = {};
    this.controlsCache = this.buildControlsCache();
    this.refsCache = this.buildRefsCache();
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

  buildRefsCache() {
    return this.getContribs("refs")
      .reduce((refs, r) => {
        refs[r.key] = r.ref;
        return refs
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

  getRef(key) {
    return this.refsCache[key];
  }

  getContribs(key) {
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

  getConf(module, key, defaultValue = null) {
    let moduleCfg = this.cfg[module] || {};
    return moduleCfg[key] !== undefined ? moduleCfg[key] : defaultValue;
  }
}

export default ModulesManager;
