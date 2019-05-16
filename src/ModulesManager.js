class ModulesManager {

  constructor(modules) {
    this.modules = modules;
    this.contributionsCache = {};
  }

  getContributions(key) {
    if (this.contributionsCache[key]) {
      return this.contributionsCache[key];
    }
    let contribs = this.modules.reduce((contributions, module) => {
      const contribution = (module.contributions || {})[key];
      if (contribution) {
        contributions.push(contribution);
      }
      return contributions;
    }, []);
    this.contributionsCache[key] = contribs;
    return contribs;
  }
}

export default ModulesManager;
