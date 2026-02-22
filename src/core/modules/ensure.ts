import { setupRegistry } from './registry-setup.js';

let isSetup = false;

export const ensureRegistry = (): void => {
  if (isSetup) {
    return;
  }

  isSetup = true;
  setupRegistry();
};