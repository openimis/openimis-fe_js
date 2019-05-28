class ModulesManager {

  constructor(modules) {
    this.modules = modules;
    this.contributionsCache = {};
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
