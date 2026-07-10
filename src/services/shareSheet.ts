import { Platform, Share } from 'react-native';

interface ShareContentOptions {
  title?: string;
  message: string;
  url?: string;
}

export async function shareContent({ title, message, url }: ShareContentOptions): Promise<boolean> {
  const fullMessage = url && Platform.OS === 'android' ? `${message}\n\n${url}` : message;

  const result = await Share.share(
    Platform.OS === 'ios' && url
      ? { title, message: fullMessage, url }
      : { title, message: fullMessage },
  );

  return result.action === Share.sharedAction;
}
