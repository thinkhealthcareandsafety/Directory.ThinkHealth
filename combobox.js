// Searchable single-select, built on top of an existing <select>.
//
// Why this exists: Brand has 204 options and City has ~500. A native <select>
// offers no way to search them. This wraps the original element rather than
// replacing it — the <select> stays in the DOM as the source of truth, keeps
// its id, and keeps firing `change`, so every existing filter listener works
// untouched.
//
// The panel is rendered into <body> rather than next to the trigger. The filter
// rail is a scroll container (`overflow-y: auto`), which clipped an in-place
// panel to a few rows. Portalling escapes every ancestor's overflow, transform
// and stacking context.

(function () {
  'use strict';

  const PANEL_MAX_H = 300;
  const GAP = 4;

  function buildCombobox(select, { searchThreshold = 8 } = {}) {
    if (select.dataset.comboReady === '1') return;
    select.dataset.comboReady = '1';

    const root = document.createElement('div');
    root.className = 'combo';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'combo-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    // The visible control replaces the <select>, so it has to carry the same
    // accessible name the <label for=...> used to provide.
    const labelEl = select.id && document.querySelector(`label[for="${select.id}"]`);
    const accName = (labelEl && labelEl.textContent.trim()) || select.getAttribute('aria-label') || 'Filter';
    trigger.setAttribute('aria-label', accName);

    const label = document.createElement('span');
    label.className = 'combo-label';

    const chev = document.createElement('span');
    chev.className = 'combo-chev';
    chev.setAttribute('aria-hidden', 'true');
    chev.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';

    trigger.append(label, chev);
    root.appendChild(trigger);

    select.parentNode.insertBefore(root, select);
    root.appendChild(select);
    select.classList.add('combo-native');

    // --- panel lives on <body> -------------------------------------------
    const panel = document.createElement('div');
    panel.className = 'combo-panel';
    panel.hidden = true;

    const searchWrap = document.createElement('div');
    searchWrap.className = 'combo-searchwrap';
    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'combo-search';
    search.placeholder = `Search ${accName.toLowerCase()}…`;
    search.setAttribute('autocomplete', 'off');
    search.setAttribute('spellcheck', 'false');
    search.setAttribute('aria-label', `Search ${accName.toLowerCase()}`);
    searchWrap.appendChild(search);

    const list = document.createElement('ul');
    list.className = 'combo-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', accName);

    const empty = document.createElement('p');
    empty.className = 'combo-empty';
    empty.hidden = true;

    panel.append(searchWrap, list, empty);
    document.body.appendChild(panel);

    let options = [];
    let activeIndex = -1;

    function syncLabel() {
      const opt = select.options[select.selectedIndex];
      label.textContent = opt ? opt.textContent : '';
      root.classList.toggle('has-value', select.value !== 'all');
    }

    function renderOptions(filter = '') {
      const q = filter.trim().toLowerCase();
      list.innerHTML = '';
      options = [];

      // City has ~500 options and this runs on every keystroke, so build into
      // a fragment and insert once rather than reflowing per row. Selection is
      // handled by one delegated listener on the list (see below) instead of
      // ~500 individual ones.
      const frag = document.createDocumentFragment();
      for (const opt of select.options) {
        if (q && !opt.textContent.toLowerCase().includes(q)) continue;
        const li = document.createElement('li');
        li.className = 'combo-option';
        li.setAttribute('role', 'option');
        li.dataset.value = opt.value;
        li.textContent = opt.textContent;
        li.title = opt.textContent;          // long names are ellipsised
        const selected = opt.value === select.value;
        li.setAttribute('aria-selected', String(selected));
        if (selected) li.classList.add('is-selected');
        frag.appendChild(li);
        options.push(li);
      }
      list.appendChild(frag);

      empty.textContent = q ? `No matches for “${filter.trim()}”` : 'No options';
      empty.hidden = options.length > 0;
      activeIndex = options.findIndex((li) => li.classList.contains('is-selected'));
      highlight();
    }

    function highlight() {
      options.forEach((li, i) => li.classList.toggle('is-active', i === activeIndex));
    }

    function position() {
      const r = trigger.getBoundingClientRect();
      // Panel can be wider than the trigger so long group names stay readable,
      // but never wider than the viewport allows.
      const width = Math.min(Math.max(r.width, 260), window.innerWidth - 24);
      const below = window.innerHeight - r.bottom - GAP;
      const above = r.top - GAP;
      const flip = below < 220 && above > below;
      // Clamp so the panel can never run off either edge: a trigger near the
      // bottom of the rail was producing a panel taller than the space left.
      const room = Math.max(0, (flip ? above : below) - 12);
      const maxH = Math.max(140, Math.min(PANEL_MAX_H, room));

      panel.style.width = `${width}px`;
      panel.style.maxHeight = `${maxH}px`;
      // Keep it on screen if the rail sits near the right edge.
      const left = Math.min(r.left, window.innerWidth - width - 12);
      panel.style.left = `${Math.max(12, left)}px`;
      if (flip) {
        panel.style.top = 'auto';
        panel.style.bottom = `${Math.max(12, window.innerHeight - r.top + GAP)}px`;
      } else {
        panel.style.bottom = 'auto';
        // Never start lower than the space it needs.
        panel.style.top = `${Math.min(r.bottom + GAP, window.innerHeight - maxH - 12)}px`;
      }
      list.style.maxHeight = `${Math.max(80, maxH - (searchWrap.hidden ? 10 : 54))}px`;
    }

    // Scroll fires far more often than the panel needs to move; coalesce to
    // at most one reposition per animation frame.
    let rafId = 0;
    function schedulePosition() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = 0; position(); });
    }

    function choose(value) {
      select.value = value;
      // Dispatch on the real <select> so existing listeners fire unchanged.
      select.dispatchEvent(new Event('change', { bubbles: true }));
      syncLabel();
      close();
      trigger.focus();
    }

    function open() {
      const useSearch = select.options.length >= searchThreshold;
      searchWrap.hidden = !useSearch;

      panel.hidden = false;
      root.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      search.value = '';
      renderOptions();
      position();

      const sel = list.querySelector('.is-selected');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
      if (useSearch) search.focus(); else panel.focus();

      document.addEventListener('mousedown', onOutside, true);
      window.addEventListener('resize', schedulePosition);
      // `true` catches scrolling inside the rail, not just the page.
      window.addEventListener('scroll', schedulePosition, true);
    }

    function close() {
      panel.hidden = true;
      root.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onOutside, true);
      window.removeEventListener('resize', schedulePosition);
      window.removeEventListener('scroll', schedulePosition, true);
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    function onOutside(e) {
      if (!root.contains(e.target) && !panel.contains(e.target)) close();
    }

    function move(delta) {
      if (!options.length) return;
      activeIndex = Math.max(0, Math.min(options.length - 1, activeIndex + delta));
      highlight();
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    // One listener for the whole list, rather than one per option.
    list.addEventListener('click', (e) => {
      const li = e.target.closest('.combo-option');
      if (li) choose(li.dataset.value);
    });

    trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    search.addEventListener('input', () => { renderOptions(search.value); position(); });

    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Tab') { close(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const target = options[activeIndex] || options[0];
        if (target) choose(target.dataset.value);
      }
    });

    select.addEventListener('change', syncLabel);

    // Setting select.value from code does NOT fire `change`, so "Clear all"
    // and the City/State cascade left the visible label showing a filter that
    // was no longer applied. Callers dispatch `combo:refresh` after any
    // programmatic change; using a dedicated event rather than `change` avoids
    // waking every filter listener and firing a fetch per control.
    select.addEventListener('combo:refresh', () => {
      syncLabel();
      if (!panel.hidden) renderOptions(search.value);
    });

    // Options themselves are replaced asynchronously (brands/cities arrive
    // from the API; the city list is rebuilt when a state is chosen).
    new MutationObserver(() => {
      syncLabel();
      if (!panel.hidden) renderOptions(search.value);
    }).observe(select, { childList: true });

    syncLabel();
  }

  window.enhanceSelect = buildCombobox;

  // ------------------------------------------------------------------
  // Free-text combobox for the form modal.
  //
  // Different problem from the filter rail: there the value set is closed
  // (you can only filter by a brand that exists), here it is open — an
  // editor must be able to record a brand the dataset has never seen. So
  // this wraps an <input type="text"> rather than a <select>, keeps the
  // input as the source of truth (form submit reads .value untouched), and
  // offers "Create new" only when the typed text matches nothing exactly.
  //
  // The point is de-duplication, not restriction: showing the existing
  // values at the moment of typing is what stops "Marriott" / "Marriot" /
  // "marriott " becoming three brands.
  // ------------------------------------------------------------------
  function buildInputCombobox(input, getValues) {
    if (!input || input.dataset.comboReady === '1') return;
    input.dataset.comboReady = '1';

    input.setAttribute('autocomplete', 'off');
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.setAttribute('aria-autocomplete', 'list');

    const panel = document.createElement('div');
    panel.className = 'combo-panel combo-panel-input';
    panel.hidden = true;

    const list = document.createElement('ul');
    list.className = 'combo-list';
    list.setAttribute('role', 'listbox');
    panel.appendChild(list);
    document.body.appendChild(panel);

    let options = [];
    let activeIndex = -1;

    function position() {
      const r = input.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - GAP;
      const above = r.top - GAP;
      const flip = below < 200 && above > below;
      const room = Math.max(0, (flip ? above : below) - 12);
      const maxH = Math.max(140, Math.min(PANEL_MAX_H, room));

      panel.style.width = `${r.width}px`;
      panel.style.maxHeight = `${maxH}px`;
      panel.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - r.width - 12))}px`;
      if (flip) {
        panel.style.top = 'auto';
        panel.style.bottom = `${Math.max(12, window.innerHeight - r.top + GAP)}px`;
      } else {
        panel.style.bottom = 'auto';
        panel.style.top = `${Math.min(r.bottom + GAP, window.innerHeight - maxH - 12)}px`;
      }
      list.style.maxHeight = `${Math.max(80, maxH - 10)}px`;
    }

    let rafId = 0;
    function schedulePosition() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => { rafId = 0; position(); });
    }

    function render() {
      const raw = input.value.trim();
      const q = raw.toLowerCase();
      const values = (getValues() || []).filter(Boolean);

      const matches = q ? values.filter((v) => v.toLowerCase().includes(q)) : values.slice();
      // Prefix matches first: typing "Taj" should surface "Taj" itself
      // before "Vivanta by Taj".
      matches.sort((a, b) => {
        const ap = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bp = b.toLowerCase().startsWith(q) ? 0 : 1;
        return ap - bp || a.localeCompare(b);
      });

      const exact = values.some((v) => v.toLowerCase() === q);
      list.innerHTML = '';
      options = [];
      const frag = document.createDocumentFragment();

      if (raw && !exact) {
        const li = document.createElement('li');
        li.className = 'combo-option combo-option-create';
        li.setAttribute('role', 'option');
        li.dataset.value = raw;
        li.textContent = `+ Create new: “${raw}”`;
        frag.appendChild(li);
        options.push(li);
      }

      matches.slice(0, 200).forEach((v) => {
        const li = document.createElement('li');
        li.className = 'combo-option';
        li.setAttribute('role', 'option');
        li.dataset.value = v;
        li.textContent = v;
        li.title = v;
        if (v === input.value) li.classList.add('is-selected');
        frag.appendChild(li);
        options.push(li);
      });

      list.appendChild(frag);
      activeIndex = options.length > 0 ? 0 : -1;
      highlight();
      return options.length > 0;
    }

    function highlight() {
      options.forEach((li, i) => li.classList.toggle('is-active', i === activeIndex));
    }

    function open() {
      if (!render()) { close(); return; }
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      position();
      document.addEventListener('mousedown', onOutside, true);
      window.addEventListener('resize', schedulePosition);
      window.addEventListener('scroll', schedulePosition, true);
    }

    function close() {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      document.removeEventListener('mousedown', onOutside, true);
      window.removeEventListener('resize', schedulePosition);
      window.removeEventListener('scroll', schedulePosition, true);
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    function onOutside(e) {
      if (e.target !== input && !panel.contains(e.target)) close();
    }

    function choose(value) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
      input.focus();
    }

    function move(delta) {
      if (!options.length) return;
      activeIndex = Math.max(0, Math.min(options.length - 1, activeIndex + delta));
      highlight();
      options[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    list.addEventListener('click', (e) => {
      const li = e.target.closest('.combo-option');
      if (li) choose(li.dataset.value);
    });

    // A disabled input never fires these, so the viewer lockdown needs no
    // special-casing here.
    input.addEventListener('focus', open);
    input.addEventListener('click', open);
    input.addEventListener('input', () => { if (panel.hidden) open(); else { render(); position(); } });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (panel.hidden) open(); else move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape') { if (!panel.hidden) { e.preventDefault(); close(); } }
      else if (e.key === 'Enter') {
        // Only intercept Enter while the list is open, so it still submits
        // the form when the dropdown isn't in the way.
        if (!panel.hidden && options[activeIndex]) {
          e.preventDefault();
          choose(options[activeIndex].dataset.value);
        }
      } else if (e.key === 'Tab') {
        close();
      }
    });
  }

  window.enhanceInputCombobox = buildInputCombobox;
})();
