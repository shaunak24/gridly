export type AuthUserMessage = {
  title: string;
  body: string;
  tone: 'error' | 'info';
};

export function authError(title: string, body: string): AuthUserMessage {
  return { title, body, tone: 'error' };
}

export function authInfo(title: string, body: string): AuthUserMessage {
  return { title, body, tone: 'info' };
}
