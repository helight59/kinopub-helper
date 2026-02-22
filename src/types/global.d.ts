export {};

declare global {
  interface Window {
    PLAYER_SEASONS?: Array<{ season: number; season_id?: number; count?: number; allWatched?: boolean }>;
    PLAYER_CURRENT_SEASON?: number;
    PLAYER_PLAYLIST?: Array<{ season?: number; episode?: number }>;
  }
}