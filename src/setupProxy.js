// // const { createProxyMiddleware } = require("http-proxy-middleware");
// const pkg = require("../package.json");


import pkg from '../package.json';

export function createViteProxy() {
  const baseApiUrlRaw = process.env.VITE_REACT_APP_API_URL || '/api';
  const baseApiUrl = baseApiUrlRaw.startsWith('/') ? baseApiUrlRaw : `/${baseApiUrlRaw}`;

  return {
    [baseApiUrl]: {
      target: pkg.proxy,
      changeOrigin: true,
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          if (process.env.VITE_REMOTE_USER) {
            proxyReq.setHeader('Remote-User', process.env.VITE_REMOTE_USER);
          }
        });
      },
    }
  };
}


// module.exports = function (app) {
//   let headers = {};
//   if (process.env.REMOTE_USER) {
//     headers["Remote-User"] = process.env.REMOTE_USER;
//   }

//   let baseApiUrl = process.env.REACT_APP_API_URL ?? '/api';
//   if (baseApiUrl.indexOf('/') !== 0) {
//     baseApiUrl = `/${baseApiUrl}`;
//   }

//   app.use(
//     baseApiUrl,
//     createProxyMiddleware({
//       target: pkg.proxy,
//       changeOrigin: true,
//       headers: headers
//     }),
//   );
// };
