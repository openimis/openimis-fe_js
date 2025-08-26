const { createProxyMiddleware } = require('http-proxy-middleware');
const packageJson = require('../package.json');

module.exports = function (app) {
  // Add dynamic API proxy first


  // Now load any static proxies from package.json (like opensearch)
  const proxyConfig = packageJson.proxies;
  if (proxyConfig && typeof proxyConfig === 'object') {
    Object.entries(proxyConfig).forEach(([key, value]) => {
      // Skip 'api' – we already handled it above
      const base = value.base;
      const target = value.target;
      const newBase = value.newBase ?? value.base;

      if (base && target) {
        app.use(
          base,
          createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: {
              [`^${base}`]: `${newBase}`,
            },
            logLevel: 'debug',
          })
        );
        console.log(`Proxy set up for [${key}]: ${base} → ${target}`);
      }
    });
  }
};
