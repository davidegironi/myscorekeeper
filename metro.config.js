const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Fix for a React Native 0.87 warning:
// "@react-native/virtualized-lists" imports this module without the ".js"
// extension, but react-native's "exports" map resolves it to an extensionless
// path that doesn't exist, triggering a Metro fallback warning. Route it
// directly to the real file so the export map is never consulted.
const FEATURE_FLAGS_SPECIFIER =
  'react-native/src/private/featureflags/ReactNativeFeatureFlags';
const FEATURE_FLAGS_FILE = require.resolve(
  'react-native/src/private/featureflags/ReactNativeFeatureFlags.js',
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith(FEATURE_FLAGS_SPECIFIER)) {
        return { filePath: FEATURE_FLAGS_FILE, type: 'sourceFile' };
      }
      // Fall back to Metro's default resolution.
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
