const { createProxyMiddleware } = require('http-proxy-middleware');
const packageJson = require('../package.json');

module.exports = function(app) {
  const proxyConfig = packageJson.proxies;
  if (proxyConfig === undefined &&  packageJson.proxy !== undefined){
    proxyConfig = {
      "api": {
        "base": process.env.REACT_APP_API_URL ?? '/api',
        "target": packageJson.proxy
      },
    }
  }
  if (proxyConfig && typeof proxyConfig === 'object') {
    Object.entries(proxyConfig).forEach(([key, value]) => {
      if (value.newBase ===  undefined){
        value.newBase = value.base;
      }
      if (value.base && value.target) {
        app.use(
          value.base,
          createProxyMiddleware({
            target: value.target,
            changeOrigin: true,
            pathRewrite: {
              [`^${value.base}`]: `${value.newBase}`,
            },
          })
        );
        console.log(`Proxy set up for ${key}: ${value.base} -> ${value.target}`);
      }
    });
  }
};