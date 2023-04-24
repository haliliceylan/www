module.exports = function (api) {
  api.cache(true);
  const presets = [
    ["@babel/preset-react"]
    ]
  const plugins = [];
  const options = {
    babelrc: false,
    configFile: false
  };
  return {
    presets,
    plugins,
    options
  };
}
