import type { AppSettings } from '../settings/index.js';
import { getSettings, matchesHost, onSettingsChanged } from '../settings/index.js';
import type { ModuleId, ModuleRegistration } from './types.js';

const registry: ModuleRegistration[] = [];

export const registerModule = (m: ModuleRegistration): void => {
  const exists = registry.some((x) => x.id === m.id);
  if (exists) {
    throw new Error(`Module already registered: ${m.id}`);
  }

  registry.push(m);
};

const sortModules = (mods: ModuleRegistration[]): ModuleRegistration[] => {
  return [...mods].sort((a, b) => {
    const ao = a.meta.order ?? 1000;
    const bo = b.meta.order ?? 1000;

    if (ao !== bo) {
      return ao - bo;
    }

    return a.meta.displayName.localeCompare(b.meta.displayName, 'ru');
  });
};

export const listRegisteredModules = (): ModuleRegistration[] => {
  return sortModules(registry);
};

export const getModulesDefaultsPatch = (): Pick<AppSettings, 'modules'> => {
  const modules: AppSettings['modules'] = {};

  for (const m of registry) {
    modules[m.id] = {
      enabled: m.defaults.enabled,
    };
  }

  return { modules };
};

const isModuleEnabled = (settings: AppSettings, id: ModuleId): boolean => {
  const m = settings.modules[id];
  if (!m) {
    return true;
  }

  return m.enabled !== false;
};

const createApi = () => {
  return {
    onSettingsChanged,
  };
};

export const initAllModules = async (): Promise<void> => {
  const w = window as unknown as { __modulesInited?: boolean; __initedModules?: Set<string> };
  if (w.__modulesInited) {
    return;
  }

  w.__modulesInited = true;
  w.__initedModules = new Set<string>();

  const settings = await getSettings();

  if (!settings.enabled) {
    return;
  }

  if (!matchesHost(settings.host)) {
    return;
  }

  const api = createApi();

  const tryInitModule = async (m: ModuleRegistration, s: AppSettings): Promise<void> => {
    if (!isModuleEnabled(s, m.id)) {
      return;
    }

    if (!w.__initedModules) {
      return;
    }

    if (w.__initedModules.has(m.id)) {
      return;
    }

    w.__initedModules.add(m.id);

    await m.init({
      settings: s,
      api,
    });
  };

  for (const m of registry) {
    await tryInitModule(m, settings);
  }

  api.onSettingsChanged((next) => {
    if (!next.enabled) {
      return;
    }

    if (!matchesHost(next.host)) {
      return;
    }

    for (const m of registry) {
      void tryInitModule(m, next);
    }
  });
};