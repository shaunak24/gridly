export type GameId = 'word-hunt';

export interface WordHuntInvitePayload {
  mode: 'custom';
  word: string;
}

export type GameInvitePayload = WordHuntInvitePayload;

export interface GameInviteRow {
  id: string;
  game_id: GameId;
  payload: GameInvitePayload;
  expires_at: string | null;
}

export interface CreateInviteResult {
  ok: true;
  id: string;
  url: string;
}

export interface CreateInviteError {
  ok: false;
  message: string;
}

export type CreateInviteResponse = CreateInviteResult | CreateInviteError;

export interface FetchInviteResult {
  ok: true;
  invite: GameInviteRow;
}

export interface FetchInviteError {
  ok: false;
  message: string;
}

export type FetchInviteResponse = FetchInviteResult | FetchInviteError;
