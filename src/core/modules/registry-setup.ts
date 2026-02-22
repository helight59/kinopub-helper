import { registerModule } from './registry.js';
import { seriesSwitcherModule } from '../../modules/series-switcher/index.js';

export const setupRegistry = (): void => {
  registerModule(seriesSwitcherModule);
};