const getPlayerEl = (): HTMLElement | null => {
  const el = document.querySelector('.player-shell media-player#player');
  return el instanceof HTMLElement ? el : null;
};

const getMainVideo = (): HTMLVideoElement | null => {
  const v = document.querySelector('.player-shell media-player#player media-provider video');
  if (v instanceof HTMLVideoElement) {
    return v;
  }

  const p = getPlayerEl();
  const sr = (p as unknown as { shadowRoot?: ShadowRoot | null })?.shadowRoot;
  if (sr) {
    const v2 = sr.querySelector('.player-shell media-provider video, video');
    if (v2 instanceof HTMLVideoElement) {
      return v2;
    }
  }

  return null;
};

export const pauseTrailer = (): void => {
  const vids = Array.from(document.querySelectorAll('#trailer video, .video-js video')).filter(
    (x): x is HTMLVideoElement => x instanceof HTMLVideoElement,
  );

  for (const v of vids) {
    try {
      if (!v.paused && !v.ended) {
        v.pause();
      }
    } catch {
      // ignore
    }
  }
};

export const tryPlayIfPossible = async (): Promise<void> => {
  const v = getMainVideo();
  if (!v) {
    return;
  }

  const start = Date.now();
  while (Date.now() - start < 2500) {
    if (v.readyState >= 2) {
      break;
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  if (!v.paused && !v.ended) {
    return;
  }

  try {
    await v.play();
  } catch {
    // ignore
  }
};