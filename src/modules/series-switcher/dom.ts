export const fireClick = (el: Element): void => {
  if (!(el instanceof HTMLElement)) {
    return;
  }

  const opts: MouseEventInit = { bubbles: true, cancelable: true, composed: true, view: window };

  try {
    el.dispatchEvent(new PointerEvent('pointerdown', { ...opts, pointerId: 1, pointerType: 'mouse' }));
  } catch {
    // ignore
  }

  el.dispatchEvent(new MouseEvent('mousedown', opts));

  try {
    el.dispatchEvent(new PointerEvent('pointerup', { ...opts, pointerId: 1, pointerType: 'mouse' }));
  } catch {
    // ignore
  }

  el.dispatchEvent(new MouseEvent('mouseup', opts));
  el.dispatchEvent(new MouseEvent('click', opts));
};

export const findNextBtn = (): Element | null => {
  return document.querySelector('button.control-button.btn-next, button.btn-next');
};

export const findPrevBtn = (): Element | null => {
  return document.querySelector('button.control-button.btn-prev, button.btn-prev');
};

export const clickNextButton = (): boolean => {
  const btn = findNextBtn();
  if (!btn) {
    return false;
  }

  fireClick(btn);
  return true;
};

export const clickPrevButton = (): boolean => {
  const btn = findPrevBtn();
  if (!btn) {
    return false;
  }

  fireClick(btn);
  return true;
};