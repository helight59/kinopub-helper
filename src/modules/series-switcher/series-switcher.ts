import { clickNextButton, clickPrevButton } from './dom.js';
import { ensureFreshPlayerData, getCachedData } from './bridge.js';
import type { Target } from './types.js';
import { parseFromUrl } from './url.js';

const uniqSortedNums = (nums: number[]): number[] => {
  const sorted = nums.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  const uniq: number[] = [];
  for (const n of sorted) {
    if (uniq.length === 0 || uniq[uniq.length - 1] !== n) {
      uniq.push(n);
    }
  }
  return uniq;
};

const getSeasonsFromDom = (): number[] => {
  const anchors = Array.from(document.querySelectorAll('a[href*="/item/view/"][href*="/s"][href*="e"]')).filter(
    (x): x is HTMLAnchorElement => x instanceof HTMLAnchorElement,
  );

  const seasons: number[] = [];
  for (const a of anchors) {
    const m = a.getAttribute('href')?.match(/\/s(\d+)e(\d+)\b/i);
    if (!m) {
      continue;
    }
    const s = Number(m[1]);
    const e = Number(m[2]);
    if (!Number.isFinite(s) || !Number.isFinite(e)) {
      continue;
    }
    if (s > 0 && e === 1) {
      seasons.push(s);
    }
  }

  return uniqSortedNums(seasons);
};

const getSeasonsSorted = (): number[] => {
  const { seasons } = getCachedData();
  if (seasons.length > 0) {
    return seasons.map((x) => x.season);
  }

  return getSeasonsFromDom();
};

const getSeasonCount = (season: number): number | null => {
  const { seasons } = getCachedData();
  const entry = seasons.find((s) => s.season === season);
  if (!entry) {
    return null;
  }
  if (!Number.isFinite(entry.count) || entry.count <= 0) {
    return null;
  }
  return entry.count;
};

const getNextTarget = (): Target => {
  const p = parseFromUrl();
  if (!p) {
    return { kind: 'none' };
  }

  const count = getSeasonCount(p.season);
  if (count !== null) {
    if (p.episode < count) {
      return { kind: 'episode', season: p.season, episode: p.episode + 1 };
    }

    const seasons = getSeasonsSorted();
    const nextSeason = seasons.find((s) => s > p.season);
    if (Number.isFinite(nextSeason)) {
      return { kind: 'season', season: nextSeason as number, episode: 1 };
    }

    return { kind: 'none' };
  }

  const { playlist } = getCachedData();
  if (playlist.length > 0) {
    const idx = playlist.findIndex((x) => x.season === p.season && x.episode === p.episode);
    const next = idx >= 0 ? playlist[idx + 1] : undefined;
    if (next && next.season === p.season && next.episode > 0) {
      return { kind: 'episode', season: p.season, episode: next.episode };
    }
  }

  const seasons = getSeasonsSorted();
  const nextSeason = seasons.find((s) => s > p.season);
  if (Number.isFinite(nextSeason)) {
    return { kind: 'season', season: nextSeason as number, episode: 1 };
  }

  return { kind: 'none' };
};

const getPrevTarget = (): Target => {
  const p = parseFromUrl();
  if (!p) {
    return { kind: 'none' };
  }

  const count = getSeasonCount(p.season);
  if (count !== null) {
    if (p.episode > 1) {
      return { kind: 'episode', season: p.season, episode: p.episode - 1 };
    }

    const seasons = getSeasonsSorted();
    const prevSeason = [...seasons].reverse().find((s) => s < p.season);
    if (!Number.isFinite(prevSeason)) {
      return { kind: 'none' };
    }

    const prevCount = getSeasonCount(prevSeason as number);
    if (prevCount !== null) {
      return { kind: 'season', season: prevSeason as number, episode: prevCount };
    }

    return { kind: 'none' };
  }

  const { playlist } = getCachedData();
  if (playlist.length > 0) {
    const idx = playlist.findIndex((x) => x.season === p.season && x.episode === p.episode);
    const prev = idx > 0 ? playlist[idx - 1] : undefined;
    if (prev && prev.season === p.season && prev.episode > 0) {
      return { kind: 'episode', season: p.season, episode: prev.episode };
    }
  }

  return { kind: 'none' };
};

const goToTarget = (t: Target): boolean => {
  if (t.kind === 'none') {
    return false;
  }

  const p = parseFromUrl();
  if (!p) {
    return false;
  }

  const url = new URL(location.href);
  url.pathname = `/item/view/${p.itemId}/s${t.season}e${t.episode}`;
  url.hash = '';
  location.assign(url.toString());
  return true;
};

export const switchNextSeries = async (): Promise<boolean> => {
  const p = parseFromUrl();
  if (!p || p.season <= 0) {
    return false;
  }

  await ensureFreshPlayerData();

  const seasons = getSeasonsSorted();
  const count = getSeasonCount(p.season);

  if (seasons.length > 0 && count !== null) {
    const nextSeason = seasons.find((s) => s > p.season);

    if (p.episode >= count) {
      if (!Number.isFinite(nextSeason)) {
        return false;
      }

      return goToTarget({ kind: 'season', season: nextSeason as number, episode: 1 });
    }
  }

  if (clickNextButton()) {
    return true;
  }

  const t = getNextTarget();
  return goToTarget(t);
};

export const switchPrevSeries = async (): Promise<boolean> => {
  const p = parseFromUrl();
  if (!p || p.season <= 0) {
    return false;
  }

  await ensureFreshPlayerData();

  if (clickPrevButton()) {
    return true;
  }

  const t = getPrevTarget();
  return goToTarget(t);
};