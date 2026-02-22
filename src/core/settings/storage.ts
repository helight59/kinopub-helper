import type { AppSettings, DeepPartial } from './types.js';
import { defaultSettings } from './defaults.js';
import { getModulesDefaultsPatch } from '../modules/index.js';

export const SETTINGS_KEY = 'kinopubHelper.settings';

const isObject = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== 'object' || v === null) {
    return false;
  }

  return true;
};

const deepMerge = <T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T => {
  const out: Record<string, unknown> = { ...base };

  for (const [k, v] of Object.entries(patch)) {
    const bv = out[k];

    if (isObject(bv) && isObject(v)) {
      out[k] = deepMerge(bv, v);
      continue;
    }

    out[k] = v;
  }

  return out as T;
};

const normalizeHost = (host: string): string => {
  return host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*/, '');
};

export const matchesHost = (host: string): boolean => {
  const h = normalizeHost(host);
  const currentHost = location.host.toLowerCase();
  const currentHostname = location.hostname.toLowerCase();

  if (h.includes(':')) {
    return currentHost === h;
  }

  if (currentHostname === h) {
    return true;
  }

  return currentHostname.endsWith(`.${h}`);
};

const withModulesDefaults = (settings: AppSettings): AppSettings => {
  const patch = getModulesDefaultsPatch();
  const merged = deepMerge(
    deepMerge(defaultSettings as unknown as Record<string, unknown>, patch as unknown as Record<string, unknown>),
    settings as unknown as Record<string, unknown>,
  );

  return merged as unknown as AppSettings;
};

export const getSettings = async (): Promise<AppSettings> => {
  const raw = await chrome.storage.sync.get(SETTINGS_KEY);
  const stored = raw[SETTINGS_KEY];

  if (!isObject(stored)) {
    return withModulesDefaults(defaultSettings);
  }

  const migrated: Record<string, unknown> = { ...stored };
  if (!isObject(migrated.modules)) {
    migrated.modules = {};
  }

  return withModulesDefaults(migrated as unknown as AppSettings);
};

export const patchSettings = async (patch: DeepPartial<AppSettings>): Promise<void> => {
  const current = await getSettings();
  const merged = deepMerge(current as unknown as Record<string, unknown>, patch as unknown as Record<string, unknown>);
  await chrome.storage.sync.set({ [SETTINGS_KEY]: merged });
};

export const onSettingsChanged = (cb: (next: AppSettings) => void): (() => void) => {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string): void => {
    if (area !== 'sync') {
      return;
    }

    const c = changes[SETTINGS_KEY];
    if (!c) {
      return;
    }

    const nv = c.newValue;

    if (!isObject(nv)) {
      cb(withModulesDefaults(defaultSettings));
      return;
    }

    const migrated: Record<string, unknown> = { ...nv };
    if (!isObject(migrated.modules)) {
      migrated.modules = {};
    }

    cb(withModulesDefaults(migrated as unknown as AppSettings));
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};

export const buildOrigins = (host: string): string[] => {
  const h = normalizeHost(host);

  if (h.includes(':')) {
    return [`http://${h}/*`, `https://${h}/*`];
  }

  return [`*://${h}/*`, `*://*.${h}/*`];
};

export const normalizeSettingsHost = normalizeHost;