const path = require('path');

module.exports = function override(config, env) {
  config.resolve = {
    alias: {
      'react':  path.resolve('./node_modules/react'),
      'react-redux':  path.resolve('./node_modules/react-redux'),
      '@material-ui':  path.resolve('./node_modules/@material-ui'),
    }
  };
  return config;
};
