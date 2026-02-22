import type { AppSettings } from '../settings/index.js';

export type ModuleId = string;

export type ModuleDefaults = {
  enabled: boolean;
};

export type ModuleMeta = {
  displayName: string;
  description: string;
  order?: number;
};

export type ModuleInitContext = {
  settings: AppSettings;
  api: {
    onSettingsChanged: (cb: (next: AppSettings) => void) => (() => void);
  };
};

export type ModuleRegistration = {
  id: ModuleId;
  meta: ModuleMeta;
  defaults: ModuleDefaults;
  init: (ctx: ModuleInitContext) => void | Promise<void>;
};