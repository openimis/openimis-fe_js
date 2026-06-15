import { loadModules, packages } from "./modules.jsx";
import { memoize } from "lodash";
import pkg from "../package.json";
import { ensureArray } from "@openimis/fe-core";
class ModulesManager {
  constructor(cfg, loadedModules) {
    this.cfg = cfg;
    this.modules = loadedModules; // Now we receive resolved modules
    this.contributionsCache = {};
    this.controlsCache = this.buildControlsCache();
    this.refsCache = this.buildRefsCache();
    this.reportsCache = this.buildReportsCache();
  }
  static async init(cfg) {
    try {
      const loadedModules = await loadModules(cfg); 
      return new ModulesManager(cfg, loadedModules);
    } catch (error) {
      throw new Error(
        "Loading modules failed in ModulesManager.js. This might be caused by duplicated modules in /src/modules.js. \n ORIGINAL ERROR: " +
          error,
      );
    }
  }
  buildControlsCache() {
    const ctrls = {};
    for (var k in this.cfg) {
      if (!!this.cfg[k].controls) {
        for (var i in this.cfg[k].controls) {
          var c = this.cfg[k].controls[i];
          ctrls[k + "." + c["field"]] = c["usage"];
        }
      }
    }
    return ctrls;
  }
  buildRefsCache() {
    return this.getContribs("refs").reduce((refs, r) => {
      refs[r.key] = r.ref;
      return refs;
    }, {});
  }
  buildReportsCache() {
    return this.getContribs("reports").reduce((acc, report) => {
      if (!report.getParams) {
        console.error(`Report ${report.key} has no getParams function.`);
      }
      if (!report.isValid) {
        console.error(`Report ${report.key} has no isValid function.`);
      }
      acc[report.key] = report;
      return acc;
    }, {});
  }
  getOpenIMISVersion() {
    return pkg.version;
  }
  getModulesVersions() {
    return packages.map((name) => `${name}@${pkg.dependencies[name] ?? "?"}`);
  }
  hideField(module, key) {
    return this.controlsCache["fe-" + module + "." + key] & 1;
  }
  getRef(key) {
    return this.refsCache[key];
  }
  getReport(ref) {
    return this.reportsCache[ref];
  }
  getProjection(key) {
    const proj = this.getRef(key);
    return !!proj ? `{${proj.join(", ")}}` : "";
  }
  getContribs = memoize((key) => {
    return this.modules.reduce((contributions, module) => [...contributions, ...ensureArray(module[key])], []);
  });
  getConf(module, key, defaultValue = null) {
    const moduleCfg = this.cfg[module] || {};
    return moduleCfg[key] !== undefined ? moduleCfg[key] : defaultValue;
  }
  getMenuEntries() {
    // Emits parent menu configs in the same shape as the backend's
    // moduleConfiguration menus: { id, name, icon, submenus, contributionKey }.
    // - Modules contributing via "core.MainMenu" supply { id, text, icon }
    //   parent definitions; we map their `text` (i18n key) onto `name`.
    // - Modules contributing children via keys like "socialProtection.MainMenu"
    //   get folded into the matching parent's `submenus`.
    let menus = {};
    this.modules.forEach((module) => {
      const mainMenuKeys = Object.keys(module).filter((key) => key.includes(".MainMenu"));
      mainMenuKeys.forEach((key) => {
        if (key === "core.MainMenu") {
          module[key].forEach((menu) => {
            const mKey = menu?.contributionKey || menu?.id || menu?.name;
            menus[mKey] = {
              id: menu?.id || menus[mKey]?.id,
              contributionKey: menu?.contributionKey || menus[mKey]?.contributionKey,
              name: menu?.text || menus[mKey]?.name,
              icon: menu?.icon || menus[mKey]?.icon,
              submenus: [
                ...ensureArray(menus[mKey]?.submenus),
                ...ensureArray(menu?.submenus),
                ...ensureArray(menu?.entries),
              ],
            };
          });
        } else {
          menus[key] = menus[key] || { id: key, submenus: [] };
          menus[key].submenus.push(...ensureArray(module[key]));
        }
      });
    });
    return Object.values(menus);
  }

  getRoutes() {
    return this.modules.reduce((map, module) => {
      const routes = ensureArray(module['core.Router'] || []);
      routes.forEach(route => {
          const rid =route.id || route.path
          map[route.path] = route;
          map[route.id || route.path] = route; 
      });
      return map;
    }, {});
  }

}
export default ModulesManager;