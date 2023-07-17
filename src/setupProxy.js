const { createProxyMiddleware } = require("http-proxy-middleware");
const pkg = require("../package.json");

module.exports = function (app) {
  let headers = {};
  if (process.env.REMOTE_USER) {
    headers["Remote-User"] = process.env.REMOTE_USER;
  }
<<<<<<< HEAD
  console.log("Proxy");
  console.log(pkg.proxy);
=======

  let baseApiUrl = process.env.REACT_APP_API_URL ?? '/api';
  if (baseApiUrl.indexOf('/') !== 0) {
    baseApiUrl = `/${baseApiUrl}`;
  }

>>>>>>> 9e68ad33284eb082dbea56359c34cebb5db7582e
  app.use(
    baseApiUrl,
    createProxyMiddleware({
      target: pkg.proxy,
      changeOrigin: true,
      headers: headers
    }),
  );
};
