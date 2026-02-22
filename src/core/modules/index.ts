export type { ModuleDefaults, ModuleId, ModuleInitContext, ModuleRegistration } from './types.js';
export { ensureRegistry } from './ensure.js';
export { getModulesDefaultsPatch, initAllModules, listRegisteredModules, registerModule } from './registry.js';