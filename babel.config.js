module.exports = function(api) {
  const plugins = [
    "transform-object-rest-spread",
    "transform-react-jsx",
    "@babel/plugin-proposal-class-properties"
  ];

  return {
    plugins
  };
};
