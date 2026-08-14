const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Declare android:appCategory="game" so portrait orientation locks are
 * exempt from large-screen adaptive-app override requirements.
 *
 * @see https://developer.android.com/develop/adaptive-apps/guides/app-orientation-aspect-ratio-resizability
 */
function withAndroidGameCategory(config) {
  return withAndroidManifest(config, (modConfig) => {
    const mainApplication = modConfig.modResults.manifest.application?.[0];
    if (!mainApplication) {
      return modConfig;
    }

    mainApplication.$ = mainApplication.$ || {};
    mainApplication.$['android:appCategory'] = 'game';

    return modConfig;
  });
}

module.exports = withAndroidGameCategory;
