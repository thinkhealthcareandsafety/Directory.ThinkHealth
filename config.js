// Shared front-end configuration, loaded by both index.html and login.html.
// Change API_BASE here (and only here) when deploying.
const API_BASE = 'https://thinkhealth-api.onrender.com/api';

const AUTH_TOKEN_KEY = 'thinkhealth_auth_token';
const AUTH_USER_KEY = 'thinkhealth_auth_user';

// ------------------------------------------------------------------
// Toast notifications — replaces window.alert() everywhere. alert() blocks
// the whole tab, looks like a browser dialog rather than part of the app,
// and can't show more than one message at a time. This is a plain queue of
// dismissible, auto-expiring banners instead. Shared here (not script.js or
// auth.js individually) since every page — directory, login, landing —
// needs a way to report an error without a browser popup.
function toast(message, { type = 'error', duration = 5000 } = {}) {
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-msg"></span><button type="button" class="toast-close" aria-label="Dismiss">&times;</button>`;
  el.querySelector('.toast-msg').textContent = message;   // never innerHTML'd — message may be server-supplied text
  stack.appendChild(el);

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    el.classList.add('is-leaving');
    // Under prefers-reduced-motion the leave animation is disabled entirely
    // (see Style.css), so animationend would never fire — a plain timeout
    // fallback ensures the toast still gets removed either way.
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 250);
  };
  el.querySelector('.toast-close').addEventListener('click', dismiss);
  const timer = setTimeout(dismiss, duration);
  el.addEventListener('mouseenter', () => clearTimeout(timer));
}

// Background video loading policy.
//
// `preload="metadata"` does little once `autoplay` is set — the browser fetches
// enough to start playing regardless. So the decision of whether to spend the
// ~2.2MB is made here instead, and the <source> is only attached when it's
// worth it. Everyone else keeps the 64KB poster, which is the same frame, so
// the page looks identical either way.
//
// Phones used to be excluded outright on the assumption that a small screen
// implies a constrained connection — it doesn't, and it also meant the video
// simply never played on mobile regardless of network quality. The real
// signals (data saver, an actually-slow connection, reduced-motion) are
// checked directly instead of treating viewport width as a proxy for them.
function shouldLoadBackgroundVideo() {
  const conn = navigator.connection || {};
  if (conn.saveData) return false;                                   // data saver on
  if (/(^|-)2g$/.test(conn.effectiveType || '')) return false;       // very slow link
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
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
