const { createProxyMiddleware } = require("http-proxy-middleware");
const pkg = require("../package.json");

module.exports = function (app) {
  let headers = {};
  if (process.env.REMOTE_USER) {
    headers["Remote-User"] = process.env.REMOTE_USER;
  }
  console.log("Proxy");
  console.log(pkg.proxy);
  app.use(
    "/api",
    createProxyMiddleware({
      target: pkg.proxy,
      changeOrigin: true,
      headers: headers,
    }),
  );
};
