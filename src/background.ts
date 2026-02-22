import { SETTINGS_KEY, buildOrigins, defaultSettings, getSettings, normalizeSettingsHost } from './core/settings/index.js';

const matchesHostForUrl = (urlStr: string, host: string): boolean => {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    return false;
  }

  const h = normalizeSettingsHost(host);
  const uHost = url.host.toLowerCase();
  const uHostname = url.hostname.toLowerCase();

  if (h.includes(':')) {
    return uHost === h;
  }

  if (uHostname === h) {
    return true;
  }

  return uHostname.endsWith(`.${h}`);
};

const ensureInjected = async (tabId: number): Promise<void> => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
  } catch {
    // ignore
  }
};

const canRunOnUrl = async (urlStr: string, host: string): Promise<boolean> => {
  if (!matchesHostForUrl(urlStr, host)) {
    return false;
  }

  const origins = buildOrigins(host);
  try {
    return await chrome.permissions.contains({ origins });
  } catch {
    return false;
  }
};

const maybeInject = async (tabId: number, urlStr: string): Promise<void> => {
  const s = await getSettings();
  if (!s.enabled) {
    return;
  }

  const ok = await canRunOnUrl(urlStr, s.host);
  if (!ok) {
    return;
  }

  await ensureInjected(tabId);
};

chrome.runtime.onInstalled.addListener(async () => {
  const current = await getSettings();
  await chrome.storage.sync.set({ [SETTINGS_KEY]: current });

  const raw = await chrome.storage.sync.get(SETTINGS_KEY);
  if (!raw[SETTINGS_KEY]) {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: defaultSettings });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') {
    return;
  }

  const urlStr = changeInfo.url ?? tab.url;
  if (!urlStr) {
    return;
  }

  void maybeInject(tabId, urlStr);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) {
    return;
  }

  void maybeInject(tabId, tab.url);
});