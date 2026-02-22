export type { AppSettings, DeepPartial } from './types.js';
export { defaultSettings } from './defaults.js';
export {
  SETTINGS_KEY,
  buildOrigins,
  getSettings,
  matchesHost,
  normalizeSettingsHost,
  onSettingsChanged,
  patchSettings,
} from './storage.js';