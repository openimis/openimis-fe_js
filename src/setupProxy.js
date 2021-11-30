const { createProxyMiddleware } = require("http-proxy-middleware");
const pkg = require("../package.json");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: pkg.proxy,
      changeOrigin: true,
      headers: { "Remote-User": "Admin" },
    })
  );
};
