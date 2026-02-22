import type { ModuleRegistration } from '../../core/modules/index.js';
import { initSeriesSwitcher } from './init.js';

export const seriesSwitcherModule: ModuleRegistration = {
  id: 'series-switcher',
  meta: {
    displayName: 'Переключение серий',
    description: 'Переключение серий через медиа кнопки (например, на клавиатуре).',
    order: 10,
  },
  defaults: {
    enabled: true,
  },
  init: initSeriesSwitcher,
};