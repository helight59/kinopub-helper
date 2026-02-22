export type PlayerSeason = { season: number; count: number };
export type PlayerItem = { season: number; episode: number };

export type Target =
  | { kind: 'episode'; season: number; episode: number }
  | { kind: 'season'; season: number; episode: number }
  | { kind: 'none' };