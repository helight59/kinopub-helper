export const parseFromUrl = (): { itemId: number; season: number; episode: number } | null => {
  const m = location.pathname.match(/\/item\/view\/(\d+)\/s(\d+)e(\d+)\b/i);
  if (!m) {
    return null;
  }

  const itemId = Number(m[1]);
  const season = Number(m[2]);
  const episode = Number(m[3]);

  if (!Number.isFinite(itemId) || !Number.isFinite(season) || !Number.isFinite(episode)) {
    return null;
  }

  return { itemId, season, episode };
};