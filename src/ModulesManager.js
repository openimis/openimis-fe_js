import modules from "./modules";
import flatten from "lodash/flatten";
import compact from "lodash/compact";

export default class ModulesManager {
  static modules = modules;

  static contributionsCache = {};

  static getMenuItems() {
    return compact(this.modules.map(module => module.menu));
  }

  static getRoutes() {
    return compact(flatten(this.modules.map(module => module.routes)));
  }

  static getContributions(key) {
    if (!this.contributionCaches.hasOwnProperty(key)) {
      this.contributionsCache[key] = this.modules.reduce((contributions, module) => {
        const contribution = (module.contributions || {})[key];
        return [...contributions, contribution];
      }, []);      
    }
    return this.contributionCaches[key];
  }
}
