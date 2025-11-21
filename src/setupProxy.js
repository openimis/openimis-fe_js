const { createProxyMiddleware } = require('http-proxy-middleware');
const packageJson = require('../package.json');

module.exports = function (app) {
  // Load proxies from package.json
  const proxyConfig = packageJson.proxies;
  if (proxyConfig && typeof proxyConfig === 'object') {
    Object.entries(proxyConfig).forEach(([key, value]) => {
      const base = value.base;
      const target = value.target;
      const newBase = value.newBase ?? value.base;

      if (base && target) {
        // Special handling for opensearch to pass JWT token
        if (key === 'opensearch') {
          app.use(
            base,
            createProxyMiddleware({
              target,
              changeOrigin: true,
              pathRewrite: newBase === "" ? undefined : {
                [`^${base}`]: `${newBase}`,
              },
              logLevel: 'debug',
              onProxyReq: (proxyReq, req, res) => {
                // Extract JWT token from cookies
                const cookies = req.headers.cookie;
                let jwtToken = null;
                
                if (cookies) {
                  const cookieArray = cookies.split(';');
                  const jwtCookie = cookieArray.find(cookie => 
                    cookie.trim().startsWith('JWT=')
                  );
                  if (jwtCookie) {
                    jwtToken = jwtCookie.split('=')[1];
                  }
                }
                
                // Add JWT token as Authorization header if available
                if (jwtToken) {
                  proxyReq.setHeader('Authorization', `Bearer ${jwtToken}`);
                  console.log('Added JWT token to opensearch request');
                } else {
                  console.log('No JWT token found in cookies for opensearch request');
                }
              },
            })
          );
        } else {
          app.use(
            base,
            createProxyMiddleware({
              target,
              changeOrigin: true,
              pathRewrite: newBase === "" ? undefined : {
                [`^${base}`]: `${newBase}`,
              },
              logLevel: 'debug',
            })
          );
        }
        console.log(`Proxy set up for [${key}]: ${base} → ${target}`);
      }
    });
  }
};
