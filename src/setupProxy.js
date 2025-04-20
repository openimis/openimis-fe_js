// This file is used by Vite's proxy configuration
// It's referenced in vite.config.js

const pkg = require("../package.json");

module.exports = {
  '/api': {
    target: pkg.proxy,
    changeOrigin: true,
    headers: process.env.REMOTE_USER ? { "Remote-User": process.env.REMOTE_USER } : {}
  },
  '/graphql': {
    target: pkg.proxy,
    changeOrigin: true,
    headers: process.env.REMOTE_USER ? { "Remote-User": process.env.REMOTE_USER } : {}
  }
};
