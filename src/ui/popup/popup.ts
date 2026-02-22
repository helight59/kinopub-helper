import { buildOrigins, getSettings, normalizeSettingsHost } from '../../core/settings/index.js';
import { ensureRegistry, listRegisteredModules } from '../../core/modules/index.js';

(() => {
  ensureRegistry();

  const $ = <T extends HTMLElement>(id: string): T => {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Element not found: #${id}`);
    }
    return el as T;
  };

  const boot = async (): Promise<void> => {
    const state = $('state');
    const modsBox = $('mods');
    const openSettings = $('openSettings') as HTMLButtonElement;

    const s = await getSettings();
    const host = normalizeSettingsHost(s.host);

    let perm = false;
    try {
      perm = await chrome.permissions.contains({ origins: buildOrigins(host) });
    } catch {
      perm = false;
    }

    state.innerHTML = `
      <div>Включено: <code>${String(s.enabled)}</code></div>
      <div>Хост: <code>${host}</code></div>
      <div>Доступ: <code>${perm ? 'есть' : 'нет'}</code></div>
    `;

    const mods = listRegisteredModules();
    modsBox.innerHTML = '';

    for (const m of mods) {
      const st = s.modules[m.id];
      const enabled = st ? st.enabled !== false : true;

      const line = document.createElement('div');
      line.className = 'mod';
      line.textContent = `${enabled ? '✅' : '⛔'} ${m.meta.displayName}`;
      modsBox.appendChild(line);
    }

    openSettings.addEventListener('click', async () => {
      await chrome.runtime.openOptionsPage();
      window.close();
    });
  };

  void boot();
})();