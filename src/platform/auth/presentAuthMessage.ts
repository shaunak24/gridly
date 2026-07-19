import { Alert } from 'react-native';

import type { AuthUserMessage } from './authMessages';

export function presentAuthMessage(message: AuthUserMessage, onDismiss?: () => void): void {
  Alert.alert(message.title, message.body, [{ text: 'OK', onPress: onDismiss }]);
}
