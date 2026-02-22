(() => {
  const $ = (id) => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing #${id}`);
    return el;
  };

  const parse = () => {
    const m = location.pathname.match(/\/item\/view\/(\d+)\/s(\d+)e(\d+)\b/i);
    if (!m) return null;
    return {
      itemId: Number(m[1]),
      season: Number(m[2]),
      episode: Number(m[3]),
    };
  };

  const render = () => {
    const se = parse();
    $('url').textContent = location.pathname;
    if (!se) {
      $('item').textContent = '-';
      $('season').textContent = '-';
      $('episode').textContent = '-';
      return;
    }
    $('item').textContent = String(se.itemId);
    $('season').textContent = String(se.season);
    $('episode').textContent = String(se.episode);
  };

  const buildPlaylist = (season) => {
    const eps = [];
    for (let i = 1; i <= 8; i += 1) {
      eps.push({ season, episode: i });
    }
    return eps;
  };

  const ensureGlobals = () => {
    const se = parse() || { itemId: 18009, season: 1, episode: 1 };

    window.PLAYER_CURRENT_SEASON = se.season;
    window.PLAYER_SEASONS = se.season > 0 ? [{ season: se.season, count: 8, allWatched: false }] : [{ season: 0, count: 1 }];
    window.PLAYER_PLAYLIST = se.season > 0 ? buildPlaylist(se.season) : [{ season: 0, episode: 1 }];
  };

  const navigate = (itemId, season, episode) => {
    const nextPath = `/item/view/${itemId}/s${season}e${episode}`;
    history.pushState({}, '', nextPath);
    ensureGlobals();
    render();
  };

  const currentIndex = () => {
    const se = parse();
    if (!se) return { se: null, idx: -1 };
    const list = window.PLAYER_PLAYLIST || [];
    const idx = list.findIndex((x) => x.season === se.season && x.episode === se.episode);
    return { se, idx };
  };

  const nextEpisode = () => {
    const { se, idx } = currentIndex();
    if (!se) return;
    const list = window.PLAYER_PLAYLIST || [];
    const next = list[idx + 1];
    if (!next) return;
    navigate(se.itemId, next.season, next.episode);
  };

  const prevEpisode = () => {
    const { se, idx } = currentIndex();
    if (!se) return;
    const list = window.PLAYER_PLAYLIST || [];
    const prev = list[idx - 1];
    if (!prev) return;
    navigate(se.itemId, prev.season, prev.episode);
  };

  const startCanvasStream = async () => {
    const video = $('video');

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');

    let t = 0;
    const draw = () => {
      t += 1;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(40 + (t % 520), 140, 80, 80);

      ctx.fillStyle = '#fff';
      ctx.font = '18px system-ui';
      ctx.fillText('Kinopub Helper Test Stream', 16, 28);
      ctx.fillText(location.pathname, 16, 54);

      requestAnimationFrame(draw);
    };
    draw();

    // Video track
    const videoStream = canvas.captureStream(30);

    // Audio track (quiet oscillator)
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    gain.gain.value = 0.02; // тихо
    osc.frequency.value = 220;

    const dest = ac.createMediaStreamDestination();
    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    // Merge tracks
    const merged = new MediaStream();
    videoStream.getVideoTracks().forEach((tr) => merged.addTrack(tr));
    dest.stream.getAudioTracks().forEach((tr) => merged.addTrack(tr));

    video.srcObject = merged;

    // Не автоплей — стартуем по кнопке, чтобы точно был user gesture.
  };

  $('start').addEventListener('click', async () => {
    await startCanvasStream();

    const video = $('video');
    try {
      await video.play();
    } catch {
      // если всё равно блок — пользователь нажмёт play в контролах
    }
  });

  const emulateBuffering = () => {
    const video = $('video');
    const wasPaused = video.paused;
    video.pause();
    setTimeout(() => {
      if (!wasPaused) {
        void video.play();
      }
    }, 1200);
  };

  window.addEventListener('popstate', () => {
    ensureGlobals();
    render();
  });

  $('next').addEventListener('click', () => nextEpisode());
  $('prev').addEventListener('click', () => prevEpisode());

  window.addEventListener('keydown', (e) => {
    if (e.key === 'b' || e.key === 'B') {
      emulateBuffering();
    }
  });

  ensureGlobals();
  render();
  void startCanvasStream();
})();