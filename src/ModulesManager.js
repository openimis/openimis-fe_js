import { loadModules, packages } from "./modules";
import { memoize } from "lodash";
import pkg from "../package.json";
import { ensureArray } from "@openimis/fe-core";

class ModulesManager {
  constructor(cfg) {
    this.cfg = cfg;
    try {
      this.modules = loadModules(cfg);
    } catch (error) {
      throw new Error(
        "Loading modules failed in ModulesManager.js. This might be caused by duplicated modules in /src/modules.js. \n ORIGINAL ERROR: " +
          error,
      );
    }
    this.contributionsCache = {};
    this.controlsCache = this.buildControlsCache();
    this.refsCache = this.buildRefsCache();
    this.reportsCache = this.buildReportsCache();
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
}

export default ModulesManager;
