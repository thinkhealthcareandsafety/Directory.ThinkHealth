// Landing page slideshow. Loaded only by about.html.
//
// Already signed in? Skip straight past the landing page — this is a
// marketing front door, not something a returning user should see again
// every time they open the app.
if (localStorage.getItem(AUTH_TOKEN_KEY)) {
  window.location.replace('index.html');
}

// ------------------------------------------------------------------
// SLIDE DATA — placeholder copy pending the real content. Facts below are
// pulled from what's already public in the site footer (training list,
// partnership/training-count claim) so this isn't lorem ipsum, but the
// wording, icons, and visuals are all meant to be replaced wholesale —
// nothing here should be treated as final.
// ------------------------------------------------------------------
const SLIDES = [
  {
    eyebrow: 'Emergency Preparedness',
    title: 'CPR & AED Training',
    headline: 'Every second counts when a guest needs help.',
    desc: 'Hands-on CPR and AED certification for hospitality staff, built around how hotels actually run — not a generic safety course.',
    cta: 'Explore Training',
    ctaHref: 'https://www.thinkhealth.in/trainings',
    icon: 'M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z M9 12l2 2 4-4',
  },
  {
    eyebrow: 'Nationwide Network',
    title: '50+ Brand Partnerships',
    headline: 'Trusted across India’s leading hotel groups.',
    desc: 'Over 70,000 individuals trained and 50+ global brand partnerships — this directory is the record of that network, kept current.',
    cta: 'View the Directory',
    ctaHref: 'index.html',
    icon: 'M4 21V9l8-6 8 6v12 M9 21v-6h6v6 M4 9h16',
  },
  {
    eyebrow: 'On-Site Readiness',
    title: 'Equipment, Not Just Training',
    headline: 'Know what’s actually on the property.',
    desc: 'AEDs, stretchers, first aid kits — this hub tracks what safety equipment each property has, alongside who to call when it matters.',
    cta: 'See How It Works',
    ctaHref: 'index.html',
    icon: 'M12 2v6 M12 16v6 M2 12h6 M16 12h6 M12 9a3 3 0 100 6 3 3 0 000-6z',
  },
  {
    eyebrow: 'Full Coverage',
    title: 'Women’s Safety & Fire Response',
    headline: 'Safety training that covers the whole property.',
    desc: 'From self-defense and women’s safety to fire evacuation and trauma response — the same standard, every location.',
    cta: 'Learn More',
    ctaHref: 'https://www.thinkhealth.in/trainings',
    icon: 'M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z M12 8v5 M12 16h.01',
  },
];

const SLIDE_DURATION_MS = 6000;
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('landingStage');
const strip = document.getElementById('landingStrip');
const dots = document.getElementById('landingDots');

let current = 0;
let timerRaf = null;
let timerStart = 0;
let paused = false;

// --- build panels (one per slide, only the active one visible) ------------
SLIDES.forEach((slide, i) => {
  const panel = document.createElement('div');
  panel.className = 'landing-panel';
  panel.hidden = i !== 0;
  panel.innerHTML = `
    <div class="landing-copy">
      <p class="landing-eyebrow">${slide.eyebrow}</p>
      <h1 class="landing-headline">${slide.headline}</h1>
      <p class="landing-desc">${slide.desc}</p>
      <a class="landing-btn landing-btn-solid landing-cta" href="${slide.ctaHref}">${slide.cta}</a>
    </div>
    <div class="landing-visual" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${slide.icon}"/></svg>
    </div>
  `;
  stage.appendChild(panel);
});

// --- build the tab strip (desktop) + dots (mobile) -------------------------
SLIDES.forEach((slide, i) => {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'landing-tab';
  tab.innerHTML = `
    <span class="landing-tab-track"><span class="landing-tab-fill"></span></span>
    <span class="landing-tab-eyebrow">${slide.eyebrow}</span>
    <span class="landing-tab-title">${slide.title}</span>
  `;
  tab.addEventListener('click', () => goTo(i));
  strip.appendChild(tab);

  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Slide ${i + 1}: ${slide.title}`);
  dot.addEventListener('click', () => goTo(i));
  dots.appendChild(dot);
});

const panels = [...stage.querySelectorAll('.landing-panel')];
const tabs = [...strip.querySelectorAll('.landing-tab')];
const dotEls = [...dots.querySelectorAll('button')];

function render() {
  panels.forEach((p, i) => {
    p.hidden = i !== current;
    p.classList.remove('is-active');
  });

  // Forces layout between removing `hidden` and adding the class that
  // drives the fade-in — without this the two DOM writes get batched into
  // one frame and the transition never plays (no "from" state to animate
  // from). More reliable than a double-rAF, which browsers can throttle or
  // suspend entirely on a backgrounded/inactive tab.
  const activePanel = panels[current];
  void activePanel.offsetWidth;
  activePanel.classList.add('is-active');

  tabs.forEach((t, i) => {
    t.classList.toggle('is-active', i === current);
    const fill = t.querySelector('.landing-tab-fill');
    fill.style.transition = 'none';
    fill.style.width = i < current ? '100%' : '0%';
  });
  dotEls.forEach((d, i) => d.classList.toggle('is-active', i === current));
}

function goTo(index) {
  current = (index + SLIDES.length) % SLIDES.length;
  render();
  restartTimer();
}

function restartTimer() {
  cancelAnimationFrame(timerRaf);
  timerStart = performance.now();

  const activeFill = tabs[current].querySelector('.landing-tab-fill');
  if (REDUCE_MOTION) {
    // No auto-advance at all under reduced motion — the person drives it
    // entirely via the tabs/dots, and the fill just shows current position.
    activeFill.style.width = '0%';
    return;
  }
  activeFill.style.transition = `width ${SLIDE_DURATION_MS}ms linear`;
  requestAnimationFrame(() => { activeFill.style.width = '100%'; });

  const tick = (now) => {
    if (paused) { timerStart += 16; timerRaf = requestAnimationFrame(tick); return; }
    if (now - timerStart >= SLIDE_DURATION_MS) {
      goTo(current + 1);
      return;
    }
    timerRaf = requestAnimationFrame(tick);
  };
  timerRaf = requestAnimationFrame(tick);
}

// Hovering (or focusing, for keyboard users tabbing through) pauses the
// advance rather than fighting the person reading a longer description.
[stage, strip].forEach((el) => {
  el.addEventListener('mouseenter', () => { paused = true; });
  el.addEventListener('mouseleave', () => { paused = false; });
  el.addEventListener('focusin', () => { paused = true; });
  el.addEventListener('focusout', () => { paused = false; });
});

render();
restartTimer();
