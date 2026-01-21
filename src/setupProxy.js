const { createProxyMiddleware } = require('http-proxy-middleware');
const packageJson = require('../package.json');

module.exports = function (app) {
  // Function to resolve template literals in strings
  function resolveTemplate(str) {
    return str.replace(/\$\{([^}]+)\}/g, (match, expr) => {
      try {
        return eval(expr);
      } catch {
        return match;
      }
    });
  }

  // Now load any static proxies from package.json (like opensearch)
  const proxyConfig = packageJson.proxies;
  if (proxyConfig && typeof proxyConfig === 'object') {
    Object.entries(proxyConfig).forEach(([key, value]) => {
      const base = value.base;
      const target = resolveTemplate(value.target);
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

  // Default API proxy with computed target
  const apiTarget = resolveTemplate('http://${process.env.API_PROXY_TARGET || \'backend\'}:8000');
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      logLevel: 'debug',
    })
  );
  console.log(`Default API proxy set up: /api → ${apiTarget}`);
};
