// Shared front-end configuration, loaded by both index.html and login.html.
// Change API_BASE here (and only here) when deploying.
const API_BASE = 'https://thinkhealth-api.onrender.com/api';

const AUTH_TOKEN_KEY = 'thinkhealth_auth_token';
const AUTH_USER_KEY = 'thinkhealth_auth_user';

// Background video loading policy.
//
// `preload="metadata"` does little once `autoplay` is set — the browser fetches
// enough to start playing regardless. So the decision of whether to spend 3.5MB
// is made here instead, and the <source> is only attached when it is worth it.
// Everyone else keeps the 64KB poster, which is the same frame, so the page
// looks identical either way.
function shouldLoadBackgroundVideo() {
  const conn = navigator.connection || {};
  if (conn.saveData) return false;                                   // data saver on
  if (/(^|-)2g$/.test(conn.effectiveType || '')) return false;       // very slow link
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (matchMedia('(max-width: 640px)').matches) return false;        // phones: poster is plenty
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.bg-video');
  if (!video) return;

  if (!shouldLoadBackgroundVideo()) {
    video.remove();   // poster (.bg-fallback) stays and carries the visual
    return;
  }

  // Two-clip playlist: clip 1 plays through, then clip 2, then back to clip 1
  // — a manual loop rather than the `loop` attribute, which only repeats a
  // single <source>. `ended` only fires on natural completion (not on a pause
  // or a seek), so this can't get stuck re-triggering itself.
  const playlist = [video.dataset.src, video.dataset.src2].filter(Boolean);
  let track = 0;

  function loadTrack(i) {
    let source = video.querySelector('source');
    if (!source) {
      source = document.createElement('source');
      source.type = 'video/mp4';
      video.appendChild(source);
    }
    source.src = playlist[i];
    video.load();
    video.play().catch(() => {});
  }

  if (playlist.length > 0) {
    loadTrack(0);
    if (playlist.length > 1) {
      video.addEventListener('ended', () => {
        track = (track + 1) % playlist.length;
        loadTrack(track);
      });
    } else {
      // Only one clip available: fall back to the simple repeat.
      video.loop = true;
    }
  }
});

// Background video autoplay guard.
// Browsers refuse autoplay under some battery-saver / data-saver settings, and
// a silent refusal would leave the page sitting on the flat fallback colour.
// Retry immediately, then again on the first user gesture, which is always
// allowed. Failures are swallowed — this is decoration, never critical.
document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('.bg-video');
  if (!video) return;

  const tryPlay = () => { video.play().catch(() => {}); };
  tryPlay();

  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    document.addEventListener(evt, tryPlay, { once: true, passive: true });
  });
});
