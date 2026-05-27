const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Set publicPath to serve assets under /front/
      webpackConfig.output.publicPath = "/front/";

      // Inject environment variables explicitly
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          "process.env.REACT_APP_SENTRY_DSN": JSON.stringify(
            process.env.REACT_APP_SENTRY_DSN || ""
          ),
          "process.env.REACT_APP_API_URL": JSON.stringify(
            process.env.REACT_APP_API_URL || "/api"
          ),
          "process.env.PUBLIC_URL": JSON.stringify(
            process.env.PUBLIC_URL || "/front"
          ),
          "process.env.OPENIMIS_CONF_JSON": JSON.stringify(
            process.env.OPENIMIS_CONF_JSON || ""
          ),
          "process.env.NODE_ENV": JSON.stringify(
            process.env.NODE_ENV || "development"
          ),
        })
      );

      webpackConfig.ignoreWarnings = [
        {
          module: /@formatjs\/fast-memoize/,
          message: /Failed to parse source map/,
        },
        {
          module: /react-double-scrollbar/,
          message: /Failed to parse source map/,
        },
      ];

      return webpackConfig;
    },
  },
  devServer: {
  },
};
