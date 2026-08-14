const { withAndroidManifest } = require('@expo/config-plugins');

const NOTIFICATIONS_SERVICE =
  'expo.modules.notifications.service.NotificationsService';

/**
 * Remove BOOT_COMPLETED boot actions from expo-notifications NotificationsService.
 *
 * Google Play static analysis flags a conflict when BOOT_COMPLETED receivers
 * coexist with expo-audio restricted foreground service types (Android 15+).
 * Scheduled notifications still work; they are not rescheduled until the app
 * opens after a device reboot.
 *
 * @see https://github.com/expo/expo/issues/41627
 * @see https://developer.android.com/about/versions/15/changes/foreground-service-types
 */
function withDisableNotificationsBootActions(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;

    manifest.$ = manifest.$ || {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const mainApplication = manifest.application?.[0];
    if (!mainApplication) {
      return modConfig;
    }

    if (!mainApplication.receiver) {
      mainApplication.receiver = [];
    }

    mainApplication.receiver = mainApplication.receiver.filter(
      (receiver) => receiver?.$?.['android:name'] !== NOTIFICATIONS_SERVICE,
    );

    mainApplication.receiver.push({
      $: {
        'android:name': NOTIFICATIONS_SERVICE,
        'android:enabled': 'true',
        'android:exported': 'false',
        'tools:node': 'replace',
      },
      'intent-filter': [
        {
          $: {
            'android:priority': '-1',
          },
          action: [
            {
              $: {
                'android:name': 'expo.modules.notifications.NOTIFICATION_EVENT',
              },
            },
            {
              $: {
                'android:name': 'android.intent.action.MY_PACKAGE_REPLACED',
              },
            },
          ],
        },
      ],
    });

    return modConfig;
  });
}

module.exports = withDisableNotificationsBootActions;
