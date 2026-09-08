const reactNativeConfig = require('@react-native/eslint-config');

module.exports = {
  ...reactNativeConfig,
  overrides: reactNativeConfig.overrides.filter(
    override => !override.env?.['jest/globals'],
  ),
  root: true,
};
