type Payload = {
  type: string;
  requestId?: string;
};

const getSnapshot = (): { seasons: unknown; playlist: unknown } => {
  const w = window as unknown as { PLAYER_SEASONS?: unknown; PLAYER_PLAYLIST?: unknown };
  return {
    seasons: w.PLAYER_SEASONS ?? null,
    playlist: w.PLAYER_PLAYLIST ?? null,
  };
};

window.addEventListener('message', (e: MessageEvent) => {
  if (e.source !== window) return;
  const data = e.data as Payload | null;
  if (!data || data.type !== 'KINOPUB_HELPER_REQUEST') return;

  const snap = getSnapshot();

  window.postMessage(
    {
      type: 'KINOPUB_HELPER_RESPONSE',
      requestId: data.requestId,
      seasons: snap.seasons,
      playlist: snap.playlist,
    },
    '*'
  );
});