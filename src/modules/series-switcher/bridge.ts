import type { PlayerItem, PlayerSeason } from './types.js';

const parseSeasons = (v: unknown): PlayerSeason[] => {
  if (!Array.isArray(v)) {
    return [];
  }

  const out: PlayerSeason[] = [];

  for (const x of v) {
    const season = Number((x as { season?: unknown })?.season);
    const count = Number((x as { count?: unknown })?.count);

    if (!Number.isFinite(season) || !Number.isFinite(count)) {
      continue;
    }

    if (season <= 0 || count <= 0) {
      continue;
    }

    out.push({ season, count });
  }

  out.sort((a, b) => a.season - b.season);

  const uniq: PlayerSeason[] = [];
  for (const s of out) {
    const last = uniq.at(-1);
    if (!last || last.season !== s.season) {
      uniq.push(s);
    }
  }

  return uniq;
};

const parsePlaylist = (v: unknown): PlayerItem[] => {
  if (!Array.isArray(v)) {
    return [];
  }

  const out: PlayerItem[] = [];
  for (const x of v) {
    const season = Number((x as { season?: unknown })?.season);
    const episode = Number((x as { episode?: unknown })?.episode);

    if (!Number.isFinite(season) || !Number.isFinite(episode)) {
      continue;
    }

    if (season <= 0 || episode <= 0) {
      continue;
    }

    out.push({ season, episode });
  }

  return out;
};

type Response = { seasons: PlayerSeason[]; playlist: PlayerItem[] };

let cachedSeasons: PlayerSeason[] = [];
let cachedPlaylist: PlayerItem[] = [];
let lastCacheAt = 0;

const ensureBridgeInjected = (): void => {
  const id = 'kinopub-helper-bridge';
  if (document.getElementById(id)) {
    return;
  }

  const s = document.createElement('script');
  s.id = id;
  s.src = chrome.runtime.getURL('bridge.js');
  s.type = 'text/javascript';
  (document.head || document.documentElement).appendChild(s);
};

export const warmupBridge = async (): Promise<void> => {
  ensureBridgeInjected();
  await new Promise((r) => setTimeout(r, 40));
  await requestPlayerData(600);
};

export const ensureFreshPlayerData = async (): Promise<void> => {
  if (Date.now() - lastCacheAt < 1500) {
    return;
  }

  await requestPlayerData(600);
};

export const getCachedData = (): Response => {
  return { seasons: cachedSeasons, playlist: cachedPlaylist };
};

const requestPlayerData = async (timeoutMs: number): Promise<void> => {
  const requestId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  await new Promise<void>((resolve) => {
    const onMessage = (e: MessageEvent): void => {
      if (e.source !== window) {
        return;
      }

      const data = e.data as
        | { type?: unknown; requestId?: unknown; seasons?: unknown; playlist?: unknown }
        | null
        | undefined;

      if (!data || data.type !== 'KINOPUB_HELPER_RESPONSE') {
        return;
      }

      if (data.requestId !== requestId) {
        return;
      }

      cleanup();

      const seasons = parseSeasons(data.seasons);
      const playlist = parsePlaylist(data.playlist);

      if (seasons.length > 0) {
        cachedSeasons = seasons;
      }

      if (playlist.length > 0) {
        cachedPlaylist = playlist;
      }

      lastCacheAt = Date.now();
      resolve();
    };

    const t = window.setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);

    const cleanup = (): void => {
      window.clearTimeout(t);
      window.removeEventListener('message', onMessage);
    };

    window.addEventListener('message', onMessage);
    window.postMessage({ type: 'KINOPUB_HELPER_REQUEST', requestId }, '*');
  });
};