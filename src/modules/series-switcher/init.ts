import type { ModuleInitContext } from '../../core/modules/index.js';
import { warmupBridge } from './bridge.js';
import { pauseTrailer, tryPlayIfPossible } from './video.js';
import { switchNextSeries, switchPrevSeries } from './series-switcher.js';

const isActiveTab = (): boolean => {
  if (document.visibilityState !== 'visible') {
    return false;
  }

  if (document.hidden) {
    return false;
  }

  return true;
};

const throttle = <T extends (...args: never[]) => void>(fn: T, ms: number): T => {
  let last = 0;

  return ((...args: never[]) => {
    const now = Date.now();
    if (now - last < ms) {
      return;
    }

    last = now;
    fn(...args);
  }) as T;
};

const clearMediaHandlers = (): void => {
  try {
    navigator.mediaSession?.setActionHandler('nexttrack', null);
  } catch {
    // ignore
  }

  try {
    navigator.mediaSession?.setActionHandler('previoustrack', null);
  } catch {
    // ignore
  }
};

export const initSeriesSwitcher = async (ctx: ModuleInitContext): Promise<void> => {
  const w = window as unknown as { __seriesSwitcherInited?: boolean };
  if (w.__seriesSwitcherInited) {
    return;
  }

  w.__seriesSwitcherInited = true;

  // Общие настройки уже проверены в initAllModules:
  // settings.enabled + matchesHost(settings.host)
  // Здесь остаётся только флаг модуля.
  const mod = ctx.settings.modules['series-switcher'];
  if (mod && mod.enabled === false) {
    clearMediaHandlers();
    return;
  }

  await warmupBridge();

  const switchNext = throttle(() => {
    if (!isActiveTab()) {
      return;
    }

    pauseTrailer();
    void switchNextSeries().then((ok) => {
      if (ok) {
        void tryPlayIfPossible();
      }
    });
  }, 250);

  const switchPrev = throttle(() => {
    if (!isActiveTab()) {
      return;
    }

    pauseTrailer();
    void switchPrevSeries().then((ok) => {
      if (ok) {
        void tryPlayIfPossible();
      }
    });
  }, 250);

  let installedAt = 0;

  const installMediaHandlers = (): void => {
    const ms = navigator.mediaSession;
    if (!ms || typeof ms.setActionHandler !== 'function') {
      return;
    }

    const now = Date.now();
    if (now - installedAt < 700) {
      return;
    }
    installedAt = now;

    try {
      ms.setActionHandler('nexttrack', () => {
        switchNext();
      });
    } catch {
      // ignore
    }

    try {
      ms.setActionHandler('previoustrack', () => {
        switchPrev();
      });
    } catch {
      // ignore
    }
  };

  const setupSpaHooks = (): void => {
    const reinstall = (): void => {
      installMediaHandlers();
    };

    const wrap = (name: 'pushState' | 'replaceState'): void => {
      const orig = history[name];

      history[name] = (...args: Parameters<History['pushState']>) => {
        const r = orig.apply(history, args as never);
        setTimeout(() => {
          reinstall();
        }, 150);
        return r;
      };
    };

    wrap('pushState');
    wrap('replaceState');

    window.addEventListener('popstate', () => {
      setTimeout(() => {
        reinstall();
      }, 150);
    });
  };

  const startReinstallLoop = (): void => {
    setInterval(() => {
      installMediaHandlers();
    }, 1500);
  };

  const setupKeydownFallback = (): void => {
    window.addEventListener(
      'keydown',
      (e) => {
        const ke = e as KeyboardEvent;

        if (ke.code === 'MediaTrackNext' || ke.key === 'MediaTrackNext') {
          ke.preventDefault();
          ke.stopPropagation();
          switchNext();
          return;
        }

        if (ke.code === 'MediaTrackPrevious' || ke.key === 'MediaTrackPrevious') {
          ke.preventDefault();
          ke.stopPropagation();
          switchPrev();
        }
      },
      true,
    );
  };

  installMediaHandlers();
  setupSpaHooks();
  setupKeydownFallback();
  startReinstallLoop();

  ctx.api.onSettingsChanged((next) => {
    const m = next.modules['series-switcher'];
    if (m && m.enabled === false) {
      clearMediaHandlers();
    }
  });
};