import modules, { versions } from "./modules";
import pkg from "../package.json";

class ModulesManager {

  constructor() {
    this.modules = modules;
    this.contributionsCache = {};
  }

  getOpenIMISVersion() {
    return pkg.version;
  }
  
  getModulesVersions() {
    return versions;
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
}

export default ModulesManager;
