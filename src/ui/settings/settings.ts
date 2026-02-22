import { buildOrigins, getSettings, normalizeSettingsHost, patchSettings } from '../../core/settings/index.js';
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

  const setStatus = (msg: string, kind: 'ok' | 'bad' | 'info' = 'info'): void => {
    const el = $('status');
    el.classList.remove('ok', 'bad');
    if (kind === 'ok') {
      el.classList.add('ok');
    }
    if (kind === 'bad') {
      el.classList.add('bad');
    }
    el.textContent = msg;
  };

  const refreshPermissionState = async (host: string): Promise<void> => {
    const permEl = $('permState');
    const h = normalizeSettingsHost(host);
    const origins = buildOrigins(h);

    try {
      const ok = await chrome.permissions.contains({ origins });
      permEl.textContent = ok ? `Доступ к хосту выдан: ${h}` : `Доступ к хосту НЕ выдан: ${h}`;
    } catch {
      permEl.textContent = `Не удалось проверить доступ для: ${h}`;
    }
  };

  const renderModules = async (): Promise<void> => {
    const box = $('modules');
    const s = await getSettings();
    const modules = listRegisteredModules();

    box.innerHTML = '';

    for (const m of modules) {
      const state = s.modules[m.id];
      const enabled = state ? state.enabled !== false : true;

      const root = document.createElement('div');
      root.className = 'mod';

      const top = document.createElement('div');
      top.className = 'modTop';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = enabled;

      input.addEventListener('change', async () => {
        await patchSettings({
          modules: {
            [m.id]: {
              enabled: input.checked,
            },
          },
        });
        setStatus(`Сохранено: модуль «${m.meta.displayName}».`, 'ok');
      });

      const textWrap = document.createElement('div');

      const title = document.createElement('div');
      title.className = 'modTitle';
      title.textContent = m.meta.displayName;

      const desc = document.createElement('div');
      desc.className = 'modDesc';
      desc.textContent = m.meta.description;

      textWrap.appendChild(title);
      textWrap.appendChild(desc);

      top.appendChild(input);
      top.appendChild(textWrap);

      root.appendChild(top);
      box.appendChild(root);
    }
  };

  const boot = async (): Promise<void> => {
    const enabledEl = $('enabled') as HTMLInputElement;
    const hostEl = $('host') as HTMLInputElement;
    const saveBtn = $('save') as HTMLButtonElement;
    const grantBtn = $('grant') as HTMLButtonElement;

    const s = await getSettings();
    enabledEl.checked = s.enabled;
    hostEl.value = s.host;

    await refreshPermissionState(s.host);
    await renderModules();

    saveBtn.addEventListener('click', async () => {
      const host = normalizeSettingsHost(hostEl.value || s.host);
      await patchSettings({
        enabled: enabledEl.checked,
        host,
      });
      setStatus('Сохранено.', 'ok');
      await refreshPermissionState(host);
      await renderModules();
    });

    grantBtn.addEventListener('click', async () => {
      const host = normalizeSettingsHost(hostEl.value || s.host);
      const origins = buildOrigins(host);

      try {
        const ok = await chrome.permissions.request({ origins });
        if (!ok) {
          setStatus('Запрос доступа отклонён.', 'bad');
          await refreshPermissionState(host);
          return;
        }

        setStatus(`Доступ выдан для: ${host}`, 'ok');
        await refreshPermissionState(host);
      } catch (e) {
        setStatus(`Ошибка запроса доступа: ${String(e)}`, 'bad');
      }
    });
  };

  void boot();
})();