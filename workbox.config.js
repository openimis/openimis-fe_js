module.exports = {
  InjectManifest: options => {
    // override InjectManifest config here
    options.maximumFileSizeToCacheInBytes = 10 * 1024 * 1024;
    return options;
  }
};
