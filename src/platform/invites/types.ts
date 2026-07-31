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

/** 'network' means we never got an answer — the link itself may be perfectly valid. */
export type FetchInviteFailureReason = 'network' | 'not-found' | 'unsupported';

export interface FetchInviteError {
  ok: false;
  reason: FetchInviteFailureReason;
  message: string;
}

export type FetchInviteResponse = FetchInviteResult | FetchInviteError;
