const { createProxyMiddleware } = require('http-proxy-middleware');
const packageJson = require('../package.json');

module.exports = function(app) {
  const proxyConfig = packageJson.proxy;

  if (proxyConfig && typeof proxyConfig === 'object') {
    Object.entries(proxyConfig).forEach(([key, value]) => {
      if (value.base && value.target) {
        app.use(
          value.base,
          createProxyMiddleware({
            target: value.target,
            changeOrigin: true,
            pathRewrite: {
              [`^${value.base}`]: '',
            },
          })
        );
        console.log(`Proxy set up for ${key}: ${value.base} -> ${value.target}`);
      }
    });
  }
};