// ============================================================
// Master Dataset — kept ONLY as the source array that
// server/scripts/extract-initial-hotels.js parses for the one-time
// Phase 1 database import. The running app no longer reads from this
// array; all data now lives in PostgreSQL via the API below.
// ============================================================
const initialHotels = [
  {
    id: "TH00001",
    name: "Aiden by Best Western Hennur Bengaluru",
    brand: "Best Western",
    group: "Best Western Hotels",
    establishmentYear: "2024",
    starRating: "3",
    hospitalityGroup: "BWH Hotels",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00002",
    name: "Alila Diwa Goa",
    brand: "Hyatt",
    group: "Hyatt",
    establishmentYear: "2010",
    starRating: "5",
    hospitalityGroup: "Hyatt Hotels Corporation",
    city: "Majorda",
    state: "Goa",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00003",
    name: "Alila Fort Bishangarh",
    brand: "Hyatt",
    group: "Hyatt",
    establishmentYear: "2017",
    starRating: "5",
    hospitalityGroup: "Hyatt Hotels Corporation",
    city: "Jaipur",
    state: "Rajasthan",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00004",
    name: "Aloft by Marriott Bengaluru Outer Ring Road",
    brand: "Aloft",
    group: "Marriott",
    establishmentYear: "2014",
    starRating: "4",
    hospitalityGroup: "Marriott International, Inc.",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    category: "-",
    securityHead: { fullName: "Ganesh Tayade", email: "Ganesh.Tayade@alofthotels.com", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "aloftbengaluru.cessnapark@alofthotels.com", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00005",
    name: "Aloft by Marriott New Delhi Aerocity",
    brand: "Aloft",
    group: "Marriott",
    establishmentYear: "2018",
    starRating: "4",
    hospitalityGroup: "Marriott International, Inc.",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    category: "-",
    securityHead: { fullName: "Subhash Gupta", email: "Subhash.Gupta@alofthotels.com", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "011 4565 0000", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00006",
    name: "Alpenhof",
    brand: "Ama Stays & Trails",
    group: "IHCL Villas",
    establishmentYear: "2023",
    starRating: "Not Classified",
    hospitalityGroup: "The Indian Hotels Company Limited",
    city: "Coorg",
    state: "Karnataka",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00007",
    name: "Amanora The Fern Pune, Series by Marriott",
    brand: "The Fern",
    group: "Marriott",
    establishmentYear: "2013",
    starRating: "4",
    hospitalityGroup: "Marriott International, Inc.",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00008",
    name: "Amaya, an SLH Hotel",
    brand: "SLH",
    group: "Hilton",
    establishmentYear: "2023",
    starRating: "5",
    hospitalityGroup: "Hilton Worldwide Holdings Inc.",
    city: "Darjeeling",
    state: "West Bengal",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00009",
    name: "Ambalama Villas",
    brand: "Ama Stays & Trails",
    group: "IHCL Villas",
    establishmentYear: "2022",
    starRating: "Not Classified",
    hospitalityGroup: "The Indian Hotels Company Limited",
    city: "Goa",
    state: "Goa",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00010",
    name: "Ambar Sarovar Portico, Gandhidham",
    brand: "Portico",
    group: "Sarova Hotels",
    establishmentYear: "2016",
    starRating: "3",
    hospitalityGroup: "Sarovar Hotels & Resorts",
    city: "Gandhidham",
    state: "Gujarat",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  },
  {
    id: "TH00011",
    name: "Ambassador, New Delhi - IHCL SeleQtions",
    brand: "IHCL SeleQtions",
    group: "Taj Hotels",
    establishmentYear: "1947",
    starRating: "5",
    hospitalityGroup: "The Indian Hotels Company Limited",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    category: "-",
    securityHead: { fullName: "Not Listed", email: "-", contact: "-" },
    generalManager: { fullName: "Not Listed", email: "-", contact: "-" },
    purchaseManager: { fullName: "Not Listed", email: "-", contact: "-" },
    otherDetails: { fullName: "-", email: "-", contact: "-" },
    linkedIn: "-",
    lastCprTraining: "-"
  }
];

// ============================================================
// API CONFIG
// ============================================================
// API_BASE, AUTH_TOKEN_KEY and AUTH_USER_KEY come from config.js.

// Authentication lives on its own page. Anything that discovers the session
// is missing or rejected sends the browser there rather than trying to
// recover in place, so the directory is never on screen unauthenticated.
let redirecting = false;
function redirectToLogin() {
  if (redirecting) return;   // several in-flight requests can 401 at once
  redirecting = true;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.location.replace('login.html');
}
let PAGE_SIZE = 20;
const PAGE_SIZE_KEY = 'thinkhealth_page_size';
const savedPageSize = parseInt(localStorage.getItem(PAGE_SIZE_KEY), 10);
if ([10, 20, 50, 100].includes(savedPageSize)) PAGE_SIZE = savedPageSize;

// ============================================================
// Auth session — real JWT login (Phase 4). Accounts are provisioned
// server-side via `npm run user:create`; there is no public registration
// endpoint, so nobody can mint themselves an admin account through the API.
// ============================================================
function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

// "Privileged" = can do hotel CRUD (admin or owner). Owner is a superset
// of admin plus the ability to approve/deny access requests.
function isPrivileged() {
  const user = getAuthUser();
  return !!user && (user.role === 'admin' || user.role === 'owner');
}

function isOwner() {
  const user = getAuthUser();
  return !!user && user.role === 'owner';
}

// ============================================================
// API request helper
// ============================================================
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getAuthToken();
    if (!token) {
      redirectToLogin();
      throw new Error('Please log in to continue.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(`Could not reach the server at ${API_BASE}. Is the API running?`);
  }

  if (auth && res.status === 401) {
    redirectToLogin();
    throw new Error('Your session expired. Please log in again.');
  }
  if (auth && res.status === 403) {
    throw new Error('You are logged in as a viewer and cannot make changes.');
  }

  if (!res.ok) {
    let payload = {};
    try { payload = await res.json(); } catch (_) { /* body wasn't JSON */ }
    const message = payload.details
      ? `${payload.error} ${payload.details.join(' ')}`
      : (payload.error || `Request failed (${res.status})`);
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Escapes text before it's interpolated into innerHTML (card templates).
// Detail-modal fields use textContent instead and don't need this.
function escapeHtml(val) {
  if (val === null || val === undefined) return '';
  return val.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidValue(val) {
  return val !== null && val !== undefined && val.toString().trim() !== '';
}

// ============================================================
// Card helpers (saved/heart toggle, rating circles)
// ============================================================
const SAVED_HOTELS_KEY = 'thinkhealth_saved_hotels';

function getSavedHotelIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SAVED_HOTELS_KEY) || '[]'));
  } catch (err) {
    return new Set();
  }
}

function toggleSavedHotel(hotelId) {
  const saved = getSavedHotelIds();
  if (saved.has(hotelId)) saved.delete(hotelId);
  else saved.add(hotelId);
  localStorage.setItem(SAVED_HOTELS_KEY, JSON.stringify([...saved]));
  return saved.has(hotelId);
}

// Star rating as real star glyphs rather than text or circles.
const STAR_PATH = 'M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z';

function renderStars(starRating) {
  const rating = parseInt(starRating, 10) || 0;
  if (!rating) return '<span class="stars-na">Unrated</span>';
  let html = `<span class="stars" role="img" aria-label="${rating} star rating">`;
  for (let i = 1; i <= 5; i++) {
    html += `<svg class="${i <= rating ? 'star-on' : 'star-off'}" width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
  }
  return html + '</span>';
}

// The 16 contact fields: four roles x (name, email, phone, linkedin).
// The "other" contact's LinkedIn lives in `linkedin_url`, not
// `other_contact_linkedin` — a historical naming quirk that would silently
// make this a 15-field count if missed.
const CONTACT_FIELDS = [
  'security_head_name', 'security_head_email', 'security_head_phone', 'security_head_linkedin',
  'general_manager_name', 'general_manager_email', 'general_manager_phone', 'general_manager_linkedin',
  'purchase_manager_name', 'purchase_manager_email', 'purchase_manager_phone', 'purchase_manager_linkedin',
  'other_contact_name', 'other_contact_email', 'other_contact_phone', 'linkedin_url',
];
const CONTACT_FIELD_TOTAL = CONTACT_FIELDS.length;

// How many of the 16 are filled in — the number behind the "3/16" badge.
function contactFilledCount(hotel) {
  return CONTACT_FIELDS.filter((f) => isValidValue(hotel[f])).length;
}

// Two states, matching the API exactly: anything recorded, or nothing.
function contactState(hotel) {
  const filled = contactFilledCount(hotel);
  return filled > 0
    ? { cls: 'is-ok', label: 'Contact available', filled }
    : { cls: 'is-none', label: 'No contact information', filled };
}

// Deterministic placeholder palette. Derived from the hotel id so a property
// keeps the same visual identity across sessions, without inventing imagery
// or pulling unrelated stock photos.
const VISUAL_PALETTE = [
  ['#2f4a42', '#1c2e2a'], ['#3b4a5c', '#222d38'], ['#4a4034', '#2b241d'],
  ['#33474a', '#1e2b2d'], ['#463a4a', '#2a222d'], ['#3f4a35', '#252d1f'],
];

function visualFor(hotel) {
  let hash = 0;
  const key = hotel.hotel_id || hotel.name || '';
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return VISUAL_PALETTE[hash % VISUAL_PALETTE.length];
}

// ============================================================
// State
// ============================================================
let currentHotels = [];  // hotels on the current page, keyed by hotel_id for lookups
let currentPage = 1;
let totalPages = 1;
let activeHotelId = null;
let searchDebounceTimer = null;

function findHotelById(hotelId) {
  return currentHotels.find((h) => h.hotel_id === hotelId);
}

// DOM References
const hotelGrid = document.getElementById('hotelGrid');
const searchInput = document.getElementById('searchInput');
const contactFilter = document.getElementById('contactFilter');
const starFilter = document.getElementById('starFilter');
const brandFilter = document.getElementById('brandFilter');
const countryFilter = document.getElementById('countryFilter');
const cityFilter = document.getElementById('cityFilter');
const stateFilter = document.getElementById('stateFilter');
const hospitalityGroupFilter = document.getElementById('hospitalityGroupFilter');
const favouritesOnlyToggle = document.getElementById('favouritesOnlyToggle');
const upcomingOnlyToggle = document.getElementById('upcomingOnlyToggle');
const sortByFilter = document.getElementById('sortByFilter');
const sortDirFilter = document.getElementById('sortDirFilter');

// Renders a horizontal single-select pill row for a <select>'s own options,
// driving the select rather than replacing it — every existing `change`
// listener on sortByFilter/sortDirFilter keeps working untouched.
function buildPillGroup(selectEl, containerEl) {
  const buttons = new Map();
  containerEl.innerHTML = '';
  Array.from(selectEl.options).forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pill';
    btn.textContent = opt.textContent;
    btn.dataset.value = opt.value;
    btn.setAttribute('aria-pressed', String(opt.value === selectEl.value));
    btn.addEventListener('click', () => {
      if (selectEl.value === opt.value) return;
      selectEl.value = opt.value;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    });
    containerEl.appendChild(btn);
    buttons.set(opt.value, btn);
  });

  const sync = () => {
    buttons.forEach((btn, value) => {
      btn.classList.toggle('is-active', value === selectEl.value);
      btn.setAttribute('aria-pressed', String(value === selectEl.value));
    });
  };
  selectEl.addEventListener('change', sync);
  sync();
}
const resultsCount = document.getElementById('resultsCount');

const paginationBar = document.getElementById('paginationBar');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');
const pageJumpForm = document.getElementById('pageJumpForm');
const pageJumpInput = document.getElementById('pageJumpInput');
const pageSizeSelect = document.getElementById('pageSizeSelect');

// Detail Modal References
const detailModal = document.getElementById('detailModal');
const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
const detailEditBtn = document.getElementById('detailEditBtn');
const detailDeleteBtn = document.getElementById('detailDeleteBtn');

// Form Modal References
const hotelModal = document.getElementById('hotelModal');
const hotelForm = document.getElementById('hotelForm');
const modalTitle = document.getElementById('modalTitle');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const saveHotelBtn = document.getElementById('saveHotelBtn');
const formErrorMsg = document.getElementById('formErrorMsg');

// Login Modal / Nav References
const logoutBtn = document.getElementById('logoutBtn');
const userStatus = document.getElementById('userStatus');
const requestAccessBtn = document.getElementById('requestAccessBtn');
const accessRequestsBtn = document.getElementById('accessRequestsBtn');
const manageUsersBtn = document.getElementById('manageUsersBtn');

// Access Requests Modal References
const accessRequestsModal = document.getElementById('accessRequestsModal');
const closeAccessRequestsModalBtn = document.getElementById('closeAccessRequestsModalBtn');
const accessRequestsList = document.getElementById('accessRequestsList');

// Per-contact delete buttons
const deleteSecBtn = document.getElementById('deleteSecBtn');
const deleteGmBtn = document.getElementById('deleteGmBtn');
const deletePurBtn = document.getElementById('deletePurBtn');
const deleteOthBtn = document.getElementById('deleteOthBtn');
const editRequestsBtn = document.getElementById('editRequestsBtn');
const editRequestsBadge = document.getElementById('editRequestsBadge');

let myAccessRequestStatus = null; // 'pending' | null

// ============================================================
// AUTH UI
// ============================================================
function updateAuthUI() {
  const user = getAuthUser();
  // Prefer the stored display name — an email like "sjasmeet7499@..." yields
  // "S", which is not necessarily the person's initial.
  if (user) {
    const source = (user.full_name || '').trim() || user.email || '';
    const initials = source.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0)).join('');
    userAvatar.textContent = initials.toUpperCase() || '–';
    userAvatar.title = user.full_name || user.email || '';
  } else {
    userAvatar.textContent = '–';
  }

  if (user) {
    userStatus.hidden = false;
    userStatus.textContent = user.full_name
      ? `${user.full_name} · ${user.email} (${user.role})`
      : `${user.email} (${user.role})`;
    logoutBtn.hidden = false;
  } else {
    userStatus.hidden = true;
    logoutBtn.hidden = true;
  }

  const privileged = isPrivileged();
  openAddModalBtn.hidden = !privileged;
  // Edit is visible to any signed-in user, viewers included — a viewer's
  // submission goes through the edit-request queue instead of writing
  // directly (see openEditModal / hotelForm submit). Delete stays
  // privileged-only: proposing a correction is reversible review, removing
  // a whole record is not something to route through "maybe, later".
  detailEditBtn.hidden = !user;
  detailDeleteBtn.hidden = !privileged;
  deleteSecBtn.hidden = !privileged;
  deleteGmBtn.hidden = !privileged;
  deletePurBtn.hidden = !privileged;
  deleteOthBtn.hidden = !privileged;

  accessRequestsBtn.hidden = !isOwner();
  manageUsersBtn.hidden = !isOwner();
  editRequestsBtn.hidden = !privileged;
  if (privileged) refreshEditRequestsBadge();

  // The rule only earns its place when there is a tools cluster to divide
  // off — a viewer sees none of these buttons, so it would float alone.
  const appbarSep = document.getElementById('appbarSep');
  if (appbarSep) {
    appbarSep.hidden = !(accessRequestsBtn.hidden === false
      || manageUsersBtn.hidden === false
      || editRequestsBtn.hidden === false);
  }

  if (user && user.role === 'viewer') {
    requestAccessBtn.hidden = false;
    if (myAccessRequestStatus === 'pending') {
      requestAccessBtn.textContent = 'Request Pending';
      requestAccessBtn.disabled = true;
    } else {
      requestAccessBtn.textContent = 'Request Admin Access';
      requestAccessBtn.disabled = false;
    }
  } else {
    requestAccessBtn.hidden = true;
  }
}

async function refreshMyAccessRequestStatus() {
  const user = getAuthUser();
  if (!user || user.role !== 'viewer') {
    myAccessRequestStatus = null;
    return;
  }
  try {
    const { data } = await request('/access-requests/mine', { auth: true });
    myAccessRequestStatus = data && data.status === 'pending' ? 'pending' : null;
  } catch (err) {
    myAccessRequestStatus = null;
  }
  updateAuthUI();
}

requestAccessBtn.addEventListener('click', async () => {
  requestAccessBtn.disabled = true;
  try {
    await request('/access-requests', { method: 'POST', auth: true });
    myAccessRequestStatus = 'pending';
    updateAuthUI();
    toast('Request sent. The owner will review it.', { type: 'success' });
  } catch (err) {
    toast(err.message);
    requestAccessBtn.disabled = false;
  }
});

// ============================================================
// ACCESS REQUESTS PANEL (owner only)
// ============================================================
function openAccessRequestsModal() {
  accessRequestsModal.classList.add('active');
  document.body.classList.add('modal-open');
  loadAccessRequests();
}

function closeAccessRequestsModal() {
  accessRequestsModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

async function loadAccessRequests() {
  accessRequestsList.innerHTML = '<p class="access-requests-empty">Loading...</p>';
  try {
    const { data } = await request('/access-requests?status=pending', { auth: true });
    if (data.length === 0) {
      accessRequestsList.innerHTML = '<p class="access-requests-empty">No pending requests.</p>';
      return;
    }
    accessRequestsList.innerHTML = '';
    data.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'access-request-row';
      row.innerHTML = `
        <div>
          <div class="access-request-email">${escapeHtml(item.requester_email)}</div>
          <div class="access-request-date">Requested ${escapeHtml(new Date(item.requested_at).toLocaleString())}</div>
        </div>
        <div class="access-request-actions">
          <button type="button" class="btn btn-secondary" data-action="deny">Deny</button>
          <button type="button" class="btn btn-edit" data-action="approve">Approve</button>
        </div>
      `;
      row.querySelector('[data-action="approve"]').addEventListener('click', () => resolveAccessRequest(item.id, 'approve'));
      row.querySelector('[data-action="deny"]').addEventListener('click', () => resolveAccessRequest(item.id, 'deny'));
      accessRequestsList.appendChild(row);
    });
  } catch (err) {
    accessRequestsList.innerHTML = `<p class="access-requests-empty">${escapeHtml(err.message)}</p>`;
  }
}

async function resolveAccessRequest(id, action) {
  try {
    await request(`/access-requests/${encodeURIComponent(id)}/${action}`, { method: 'POST', auth: true });
    await loadAccessRequests();
  } catch (err) {
    toast(err.message);
  }
}

accessRequestsBtn.addEventListener('click', openAccessRequestsModal);
closeAccessRequestsModalBtn.addEventListener('click', closeAccessRequestsModal);

// ============================================================
// PER-CONTACT DELETE
// ============================================================
const CONTACT_ROLE_FIELDS = {
  security_head: ['security_head_name', 'security_head_email', 'security_head_phone', 'security_head_linkedin'],
  general_manager: ['general_manager_name', 'general_manager_email', 'general_manager_phone', 'general_manager_linkedin'],
  purchase_manager: ['purchase_manager_name', 'purchase_manager_email', 'purchase_manager_phone', 'purchase_manager_linkedin'],
  other_contact: ['other_contact_name', 'other_contact_email', 'other_contact_phone', 'linkedin_url'],
};
const CONTACT_ROLE_LABELS = {
  security_head: 'Security Head',
  general_manager: 'General Manager',
  purchase_manager: 'Purchase Manager',
  other_contact: 'Other Details',
};
const CONTACT_ROLE_BUTTONS = {
  security_head: deleteSecBtn,
  general_manager: deleteGmBtn,
  purchase_manager: deletePurBtn,
  other_contact: deleteOthBtn,
};

async function deleteContactRole(role) {
  if (!activeHotelId) return;
  if (!confirm(`Clear the ${CONTACT_ROLE_LABELS[role]} contact for this hotel?`)) return;

  const payload = {};
  CONTACT_ROLE_FIELDS[role].forEach((field) => { payload[field] = ''; });

  const btn = CONTACT_ROLE_BUTTONS[role];
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    await request(`/hotels/${encodeURIComponent(activeHotelId)}`, { method: 'PUT', body: payload, auth: true });
    await openDetailModal(activeHotelId, { forceRefresh: true });
    await fetchHotels(currentPage);
  } catch (err) {
    toast(`Could not delete contact: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

deleteSecBtn.addEventListener('click', () => deleteContactRole('security_head'));
deleteGmBtn.addEventListener('click', () => deleteContactRole('general_manager'));
deletePurBtn.addEventListener('click', () => deleteContactRole('purchase_manager'));
deleteOthBtn.addEventListener('click', () => deleteContactRole('other_contact'));

// Signing out is a full page transition, not a UI state change — this
// guarantees no stale hotel data is left rendered behind a login screen.
logoutBtn.addEventListener('click', () => {
  clearAuthSession();
  window.location.replace('login.html');
});

// ============================================================
// FETCH + RENDER
// ============================================================
async function fetchHotels(page = 1) {
  resultsCount.textContent = 'Loading…';
  renderSkeletons();

  const params = new URLSearchParams();
  params.set('page', page);
  params.set('limit', PAGE_SIZE);
  if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
  if (starFilter.value !== 'all') params.set('star_rating', starFilter.value);
  if (brandFilter.value !== 'all') params.set('brand', brandFilter.value);
  if (countryFilter.value !== 'all') params.set('country', countryFilter.value);
  if (cityFilter.value !== 'all') params.set('city', cityFilter.value);
  if (stateFilter.value !== 'all') params.set('state', stateFilter.value);
  if (hospitalityGroupFilter.value !== 'all') params.set('hospitality_group', hospitalityGroupFilter.value);
  if (contactFilter.value !== 'all') params.set('contact_status', contactFilter.value);
  if (upcomingOnlyToggle.checked) params.set('upcoming', 'true');
  if (favouritesOnlyToggle.checked) {
    // Favourites live client-side, so the exact id set is sent to the server
    // rather than filtering a page of results after the fact — that would
    // break pagination and sorting for anything but a trivial saved list.
    params.set('hotel_ids', [...getSavedHotelIds()].join(','));
  }
  params.set('sort_by', sortByFilter.value);
  params.set('sort_dir', sortDirFilter.value);

  try {
    const { data, pagination } = await request(`/hotels?${params.toString()}`, { auth: true });
    currentHotels = data;
    currentPage = pagination.page;
    totalPages = Math.max(pagination.totalPages, 1);
    if (!hasActiveQuery()) setHeroCount(pagination.total);
    renderHotels(data, pagination.total);
    updatePaginationControls();
  } catch (err) {
    // Auth errors: request() already redirected to the login page.
    if (err.message === 'Please log in to continue.' || err.message.startsWith('Your session expired')) return;
    resultsCount.textContent = 'Unavailable';
    renderErrorState(err.message);
    paginationBar.style.display = 'none';
  }
}

function updatePaginationControls() {
  paginationBar.style.display = 'flex';
  pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
  pageJumpInput.max = String(totalPages);
  pageJumpInput.value = '';
  pageJumpInput.placeholder = `Go to… (1–${totalPages})`;
}

// RENDER CARDS
function renderHotels(hotels, total) {
  hotelGrid.setAttribute('aria-busy', 'false');
  hotelGrid.innerHTML = '';

  const fmt = new Intl.NumberFormat('en-IN');
  resultsCount.textContent = total === 1 ? '1 property' : `${fmt.format(total)} properties`;

  if (hotels.length === 0) {
    renderEmptyState();
    return;
  }

  const savedIds = getSavedHotelIds();
  const frag = document.createDocumentFragment();

  hotels.forEach((hotel) => {
    const status = contactState(hotel);
    const isSaved = savedIds.has(hotel.hotel_id);
    const initial = (hotel.name || '?').trim().charAt(0).toUpperCase();
    const [va, vb] = visualFor(hotel);

    // Each fact gets its own labelled row. Previously these were run
    // together as "Kolkata · West Bengal" / "Ama Stays & Trails · IHCL
    // Villas", which left no way to tell city from state or brand from
    // group without already knowing the data.
    const facts = [
      ['City', hotel.city],
      ['State', hotel.state],
      ['Brand', hotel.brand],
      ['Group', hotel.group_name],
    ].filter(([, v]) => isValidValue(v));
    // A future establishment year means the property hasn't opened yet —
    // worth calling out rather than reading as an ordinary "Est." date.
    const upcoming = isUpcoming(hotel);
    const year = isValidValue(hotel.establishment_year);

    // <article> with a button-like affordance: keyboard reachable and announced.
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${hotel.name || 'Hotel'} — view details`);
    card.style.setProperty('--v-a', va);
    card.style.setProperty('--v-b', vb);

    card.innerHTML = `
      <div class="card-visual">
        <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g fill="none" stroke="rgba(255,255,255,0.13)" stroke-width="1.5">
            <path d="M40 165h240M62 165V96l38-26 38 26v69M180 165V112h72v53"/>
            <path d="M76 116h16v14H76zM108 116h16v14h-16zM76 140h16v14H76zM108 140h16v14h-16z"/>
            <path d="M196 128h14v12h-14zM224 128h14v12h-14zM196 148h14v12h-14zM224 148h14v12h-14z"/>
            <path d="M100 70v-12"/>
          </g>
          <path d="M0 176h320v24H0z" fill="rgba(0,0,0,0.16)"/>
        </svg>
        <span class="card-monogram" aria-hidden="true">${escapeHtml(initial)}</span>
        ${upcoming ? `<span class="card-upcoming">Upcoming ${escapeHtml(hotel.establishment_year)}</span>` : ''}
        <span class="card-cta" aria-hidden="true">
          View details
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </span>
        <button type="button" class="card-fav${isSaved ? ' is-saved' : ''}"
                aria-label="${isSaved ? 'Remove from' : 'Add to'} saved hotels"
                aria-pressed="${isSaved}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20.8 8.6c0 5-8.8 10.2-8.8 10.2S3.2 13.6 3.2 8.6a4.8 4.8 0 018.8-2.7 4.8 4.8 0 018.8 2.7z"/>
          </svg>
        </button>
      </div>

      <div class="card-body">
        <h3 class="card-name">${escapeHtml(hotel.name)}</h3>

        <dl class="card-facts">
          ${facts.map(([label, value]) => `
            <div class="card-fact">
              <dt>${label}</dt><dd>${escapeHtml(value)}</dd>
            </div>`).join('')}
          ${year ? `<div class="card-fact">
              <dt>${upcoming ? 'Opening' : 'Est.'}</dt><dd>${escapeHtml(hotel.establishment_year)}</dd>
            </div>` : ''}
        </dl>

        <div class="card-metarow">
          <span class="card-id">${escapeHtml(hotel.hotel_id)}</span>
          ${renderStars(hotel.star_rating)}
        </div>
      </div>

      <div class="card-status ${status.cls}">
        <span class="status-dot" aria-hidden="true"></span>
        <span class="card-status-text">${status.label}</span>
        <span class="fillcount" title="${status.filled} of ${CONTACT_FIELD_TOTAL} contact fields recorded">${status.filled}/${CONTACT_FIELD_TOTAL}</span>
      </div>
    `;

    const open = () => openDetailModal(hotel.hotel_id);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    const fav = card.querySelector('.card-fav');
    fav.addEventListener('click', (e) => {
      e.stopPropagation();
      const nowSaved = toggleSavedHotel(hotel.hotel_id);
      fav.classList.toggle('is-saved', nowSaved);
      fav.setAttribute('aria-pressed', String(nowSaved));
      fav.setAttribute('aria-label', `${nowSaved ? 'Remove from' : 'Add to'} saved hotels`);
      if (nowSaved) {
        fav.classList.add('just-saved');
        fav.addEventListener('animationend', () => fav.classList.remove('just-saved'), { once: true });
      }
    });

    frag.appendChild(card);
  });

  hotelGrid.appendChild(frag);
}

// --- Skeletons -------------------------------------------------------------
function renderSkeletons(count = PAGE_SIZE) {
  hotelGrid.setAttribute('aria-busy', 'true');
  hotelGrid.innerHTML = Array.from({ length: count }, () => `
    <div class="skel" aria-hidden="true">
      <div class="skel-visual"></div>
      <div class="skel-body">
        <div class="skel-line w40"></div>
        <div class="skel-line w85"></div>
        <div class="skel-line w60"></div>
        <div class="skel-line w30"></div>
      </div>
    </div>`).join('');
}

// --- Empty / error states --------------------------------------------------
function stateMarkup({ icon, title, body, action, variant = '' }) {
  return `
    <div class="state ${variant}">
      <div class="state-icon">${icon}</div>
      <h3 class="state-title">${title}</h3>
      <p class="state-body">${body}</p>
      ${action || ''}
    </div>`;
}

function renderEmptyState() {
  const filtered = activeFilterCount() > 0;
  const searching = searchInput.value.trim().length > 0;

  if (searching) {
    hotelGrid.innerHTML = stateMarkup({
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
      title: 'No matching properties',
      body: `Nothing matched “${escapeHtml(searchInput.value.trim())}”. Try a different name, city, brand or Hotel ID.`,
      action: '<button type="button" class="btn btn-secondary btn-sm" data-action="clear-search">Clear search</button>',
    });
  } else if (filtered) {
    hotelGrid.innerHTML = stateMarkup({
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18M6 12h12M10 19h4"/></svg>`,
      title: 'No hotels match your current filters',
      body: 'Try widening or removing a filter to see more of the directory.',
      action: '<button type="button" class="btn btn-secondary btn-sm" data-action="clear-filters">Clear all filters</button>',
    });
  } else {
    hotelGrid.innerHTML = stateMarkup({
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16M7 20V9l5-4 5 4v11"/></svg>`,
      title: 'No properties yet',
      body: 'The directory is empty. Add your first hotel to get started.',
    });
  }
}

function renderErrorState(message) {
  hotelGrid.setAttribute('aria-busy', 'false');
  hotelGrid.innerHTML = stateMarkup({
    variant: 'is-error',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>`,
    title: 'Could not load the directory',
    body: escapeHtml(message || 'Something went wrong while contacting the server.'),
    action: '<button type="button" class="btn btn-secondary btn-sm" data-action="retry">Try again</button>',
  });
}

// State buttons are re-created on every render, so delegate from the grid.
hotelGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'clear-search') { searchInput.value = ''; syncSearchClear(); fetchHotels(1); }
  if (action === 'clear-filters') clearAllFilters();
  if (action === 'retry') fetchHotels(currentPage);
});

// ============================================================
// DETAIL MODAL
// ============================================================
async function openDetailModal(hotelId, { forceRefresh = false } = {}) {
  let hotel = forceRefresh ? null : findHotelById(hotelId);
  if (!hotel) {
    try {
      const { data } = await request(`/hotels/${encodeURIComponent(hotelId)}`, { auth: true });
      hotel = data;
    } catch (err) {
      toast(`Could not load hotel ${hotelId}: ${err.message}`);
      return;
    }
  }

  activeHotelId = hotel.hotel_id;

  document.getElementById('viewHotelId').textContent = hotel.hotel_id;
  // Reuse the directory's star renderer so the rating reads identically here.
  document.getElementById('viewStarRating').innerHTML = renderStars(hotel.star_rating);

  // Same three-state vocabulary as the directory cards, so a property reads
  // identically whether you see it in the grid or the detail view.
  const status = contactState(hotel);
  const statusBadge = document.getElementById('viewContactStatus');
  statusBadge.className = `detail-status ${status.cls}`;
  statusBadge.innerHTML =
    `<span class="status-dot" aria-hidden="true"></span>${status.label}` +
    `<span class="fillcount" title="${status.filled} of ${CONTACT_FIELD_TOTAL} contact fields recorded">${status.filled}/${CONTACT_FIELD_TOTAL}</span>`;

  document.getElementById('viewHotelName').textContent = hotel.name;
  document.getElementById('viewLocation').textContent =
    [hotel.city, hotel.state, hotel.country || 'India'].filter(isValidValue).join(', ');

  document.getElementById('viewBrand').textContent = hotel.brand || '-';
  document.getElementById('viewGroup').textContent = hotel.group_name || '-';
  document.getElementById('viewParent').textContent = hotel.hospitality_group || '-';
  document.getElementById('viewEstYear').textContent = hotel.establishment_year || '-';
  document.getElementById('viewCategory').textContent = hotel.category || 'General';
  document.getElementById('viewCprDate').textContent = hotel.last_cpr_training || 'N/A';

  renderProducts(hotel);

  document.getElementById('viewSecName').textContent = hotel.security_head_name || '-';
  document.getElementById('viewSecEmail').textContent = hotel.security_head_email || '-';
  document.getElementById('viewSecPhone').textContent = hotel.security_head_phone || '-';
  document.getElementById('viewSecLinkedIn').textContent = hotel.security_head_linkedin || '-';

  document.getElementById('viewGmName').textContent = hotel.general_manager_name || '-';
  document.getElementById('viewGmEmail').textContent = hotel.general_manager_email || '-';
  document.getElementById('viewGmPhone').textContent = hotel.general_manager_phone || '-';
  document.getElementById('viewGmLinkedIn').textContent = hotel.general_manager_linkedin || '-';

  document.getElementById('viewPurName').textContent = hotel.purchase_manager_name || '-';
  document.getElementById('viewPurEmail').textContent = hotel.purchase_manager_email || '-';
  document.getElementById('viewPurPhone').textContent = hotel.purchase_manager_phone || '-';
  document.getElementById('viewPurLinkedIn').textContent = hotel.purchase_manager_linkedin || '-';

  document.getElementById('viewOthName').textContent = hotel.other_contact_name || '-';
  document.getElementById('viewOthEmail').textContent = hotel.other_contact_email || '-';
  document.getElementById('viewOthPhone').textContent = hotel.other_contact_phone || '-';
  document.getElementById('viewLinkedIn').textContent = hotel.linkedin_url || '-';

  detailModal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeDetailModal() {
  detailModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

detailEditBtn.addEventListener('click', () => {
  const hotelId = activeHotelId;
  closeDetailModal();
  openEditModal(hotelId);
});

detailDeleteBtn.addEventListener('click', async () => {
  if (!activeHotelId) return;
  const hotel = findHotelById(activeHotelId);
  const hotelName = hotel ? hotel.name : activeHotelId;

  if (!confirm(`Are you sure you want to delete "${hotelName}" (${activeHotelId})?`)) return;

  const originalLabel = detailDeleteBtn.textContent;
  detailDeleteBtn.disabled = true;
  detailDeleteBtn.textContent = 'Deleting...';
  detailEditBtn.disabled = true;

  try {
    await request(`/hotels/${encodeURIComponent(activeHotelId)}`, { method: 'DELETE', auth: true });
    closeDetailModal();
    await fetchHotels(currentPage);
  } catch (err) {
    toast(`Could not delete: ${err.message}`);
  } finally {
    detailDeleteBtn.disabled = false;
    detailDeleteBtn.textContent = originalLabel;
    detailEditBtn.disabled = false;
  }
});

// ============================================================
// PRODUCTS (on-site equipment)
// ============================================================
// Keys must match PRODUCT_KEYS in server/src/routes/hotels.js — the server
// whitelists against its own copy, so an unknown key here is dropped rather
// than stored. Add an item in both places to extend the list.
// A property whose establishment year is still ahead of us hasn't opened.
// The server filters on its own clock; this is only for labelling.
function isUpcoming(hotel) {
  const y = parseInt(hotel.establishment_year, 10);
  return Number.isInteger(y) && y > new Date().getFullYear();
}

const PRODUCTS = [
  { key: 'aed', label: 'AED', hint: 'Defibrillator' },
  { key: 'stretcher', label: 'Stretcher' },
  { key: 'wheelchair', label: 'Wheelchair' },
  { key: 'first_aid_kit', label: 'First Aid Kit' },
  { key: 'oxygen_cylinder', label: 'Oxygen Cylinder' },
  { key: 'spine_board', label: 'Spine Board' },
];

const productsGrid = document.getElementById('productsGrid');
const productsStatus = document.getElementById('productsStatus');
const productsNote = document.getElementById('productsNote');
const saveProductsBtn = document.getElementById('saveProductsBtn');

function renderProducts(hotel) {
  const owned = new Set(Array.isArray(hotel.products) ? hotel.products : []);
  const canEdit = isPrivileged();

  productsGrid.innerHTML = '';
  const frag = document.createDocumentFragment();

  PRODUCTS.forEach(({ key, label, hint }) => {
    const li = document.createElement('li');
    li.className = 'product-item';

    const wrap = document.createElement('label');
    wrap.className = 'product-check';
    if (!canEdit) wrap.classList.add('is-readonly');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = owned.has(key);
    box.dataset.productKey = key;
    box.disabled = !canEdit;

    const tick = document.createElement('span');
    tick.className = 'product-tick';
    tick.setAttribute('aria-hidden', 'true');
    tick.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><path d="M4 12.5l5.5 5.5L20 7"/></svg>';

    const text = document.createElement('span');
    text.className = 'product-text';
    text.textContent = label;
    if (hint) {
      const small = document.createElement('small');
      small.textContent = hint;
      text.appendChild(small);
    }

    wrap.append(box, tick, text);
    li.appendChild(wrap);
    frag.appendChild(li);
  });

  productsGrid.appendChild(frag);
  productsNote.hidden = canEdit;
  saveProductsBtn.hidden = !canEdit;
  saveProductsBtn.disabled = true;   // nothing ticked yet this time round
  saveProductsBtn.textContent = 'Save Products';
  updateProductsStatus();
}

function updateProductsStatus() {
  const total = PRODUCTS.length;
  const n = productsGrid.querySelectorAll('input:checked').length;
  productsStatus.hidden = false;
  productsStatus.textContent = `${n} of ${total}`;
  productsStatus.classList.toggle('is-empty', n === 0);
}

// Ticking a box only stages the change — nothing is written until Save is
// pressed. A checklist that saved on every click was surprising: a misclick
// silently changed the live record with no chance to back out.
productsGrid.addEventListener('change', (e) => {
  if (!e.target.closest('input[type="checkbox"]')) return;
  updateProductsStatus();
  saveProductsBtn.disabled = false;
  saveProductsBtn.textContent = 'Save Products';
});

saveProductsBtn.addEventListener('click', async () => {
  if (!activeHotelId) return;

  const selected = [...productsGrid.querySelectorAll('input:checked')].map((b) => b.dataset.productKey);
  const boxes = [...productsGrid.querySelectorAll('input')];
  boxes.forEach((b) => { b.disabled = true; });
  saveProductsBtn.disabled = true;
  saveProductsBtn.textContent = 'Saving...';

  try {
    await request(`/hotels/${encodeURIComponent(activeHotelId)}/products`, {
      method: 'PATCH', body: { products: selected }, auth: true,
    });
    // Keep the cached row in step so reopening the modal (or re-rendering
    // the grid) doesn't show the pre-save state.
    const cached = findHotelById(activeHotelId);
    if (cached) cached.products = selected;
    saveProductsBtn.textContent = 'Saved';
    setTimeout(() => { saveProductsBtn.textContent = 'Save Products'; }, 1500);
  } catch (err) {
    toast(`Could not save: ${err.message}`);
    saveProductsBtn.disabled = false;
    saveProductsBtn.textContent = 'Save Products';
  } finally {
    boxes.forEach((b) => { b.disabled = false; });
  }
});

// ============================================================
// FORM MODAL
// ============================================================

// Populated by loadFilterOptions(); read live by the pickers below so a
// value created earlier in the session is offered on the next edit.
let formOptionSource = {
  brands: [], groups: [], hospitality_groups: [], categories: [], cities: [], states: [],
};

// Every field in the "Basic Hotel Details" fieldset. A viewer may propose
// contact corrections but not touch a hotel's identity or classification —
// the server rejects these on /edit-requests regardless, this just stops the
// form inviting an edit that would only bounce.
const BASIC_DETAIL_FIELDS = [
  'hotelId', 'starRating', 'hotelName', 'brand', 'group',
  'hospitalityGroup', 'category', 'city', 'state',
  'establishmentYear', 'lastCprTraining',
];

// The 16 contact fields, by API name — the only thing a viewer may propose.
// Mirrors CONTACT_FIELDS in server/src/routes/hotels.js; note the last one
// is `linkedin_url`, not `other_contact_linkedin`.
const CONTACT_FIELD_KEYS = [
  'security_head_name', 'security_head_email', 'security_head_phone', 'security_head_linkedin',
  'general_manager_name', 'general_manager_email', 'general_manager_phone', 'general_manager_linkedin',
  'purchase_manager_name', 'purchase_manager_email', 'purchase_manager_phone', 'purchase_manager_linkedin',
  'other_contact_name', 'other_contact_email', 'other_contact_phone', 'linkedin_url',
];

function setBasicDetailsEditable(editable) {
  BASIC_DETAIL_FIELDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !editable;
  });
  const fieldset = document.getElementById('basicDetailsFieldset');
  if (fieldset) fieldset.classList.toggle('is-locked', !editable);
  const note = document.getElementById('basicDetailsLockNote');
  if (note) note.hidden = editable;
}

// Attach the type-to-filter + create-new pickers once. They read
// formOptionSource lazily, so they don't need rebuilding when it refreshes.
function initFormPickers() {
  if (!window.enhanceInputCombobox) return;
  const pairs = [
    ['brand', 'brands'],
    ['group', 'groups'],
    ['hospitalityGroup', 'hospitality_groups'],
    ['category', 'categories'],
    ['city', 'cities'],
    ['state', 'states'],
  ];
  pairs.forEach(([inputId, sourceKey]) => {
    const el = document.getElementById(inputId);
    if (el) window.enhanceInputCombobox(el, () => formOptionSource[sourceKey] || []);
  });
}

async function openAddModal() {
  modalTitle.textContent = "Add New Hotel Record";
  saveHotelBtn.textContent = "Save Record";
  setBasicDetailsEditable(true);   // Add Hotel is admin/owner only
  hotelForm.reset();
  document.getElementById('formIndex').value = "";
  formErrorMsg.hidden = true;
  hotelModal.classList.add('active');
  document.body.classList.add('modal-open');

  // Suggest the next free id. The server decides it, so two people adding a
  // hotel at once can't be handed the same one; the field stays editable and
  // the API still rejects a duplicate, so this is a convenience, not a lock.
  const idField = document.getElementById('hotelId');
  idField.value = '';
  idField.placeholder = 'Fetching next ID…';
  try {
    const { data } = await request('/hotels/meta/next-id', { auth: true });
    if (!document.getElementById('formIndex').value) idField.value = data.hotel_id;
  } catch (err) {
    // Non-fatal: fall back to manual entry rather than blocking the form.
    console.warn('Could not fetch next hotel ID:', err.message);
  } finally {
    idField.placeholder = 'e.g., TH00005';
  }
}

function openEditModal(hotelId) {
  const hotel = findHotelById(hotelId);
  if (!hotel) {
    toast(`Could not find hotel ${hotelId} to edit.`);
    return;
  }

  const privileged = isPrivileged();
  modalTitle.textContent = privileged ? "Edit Hotel Record" : "Suggest an Edit";
  saveHotelBtn.textContent = privileged ? "Save Record" : "Submit for Approval";
  formErrorMsg.hidden = true;

  // A viewer proposes contact corrections only — the whole Basic Hotel
  // Details block is locked rather than silently ignored on submit. The
  // server enforces the same boundary independently.
  setBasicDetailsEditable(privileged);

  document.getElementById('formIndex').value = hotel.hotel_id;
  document.getElementById('hotelId').value = hotel.hotel_id || '';
  document.getElementById('hotelName').value = hotel.name || '';
  document.getElementById('brand').value = hotel.brand || '';
  document.getElementById('group').value = hotel.group_name || '';
  document.getElementById('hospitalityGroup').value = hotel.hospitality_group || '';
  document.getElementById('category').value = hotel.category || '';
  document.getElementById('city').value = hotel.city || '';
  document.getElementById('state').value = hotel.state || '';
  document.getElementById('starRating').value = hotel.star_rating || 5;
  document.getElementById('establishmentYear').value = hotel.establishment_year || '';
  document.getElementById('lastCprTraining').value = hotel.last_cpr_training || '';

  document.getElementById('secName').value = hotel.security_head_name || '';
  document.getElementById('secEmail').value = hotel.security_head_email || '';
  document.getElementById('secPhone').value = hotel.security_head_phone || '';
  document.getElementById('secLinkedIn').value = hotel.security_head_linkedin || '';

  document.getElementById('gmName').value = hotel.general_manager_name || '';
  document.getElementById('gmEmail').value = hotel.general_manager_email || '';
  document.getElementById('gmPhone').value = hotel.general_manager_phone || '';
  document.getElementById('gmLinkedIn').value = hotel.general_manager_linkedin || '';

  document.getElementById('purName').value = hotel.purchase_manager_name || '';
  document.getElementById('purEmail').value = hotel.purchase_manager_email || '';
  document.getElementById('purPhone').value = hotel.purchase_manager_phone || '';
  document.getElementById('purLinkedIn').value = hotel.purchase_manager_linkedin || '';

  document.getElementById('othName').value = hotel.other_contact_name || '';
  document.getElementById('othEmail').value = hotel.other_contact_email || '';
  document.getElementById('othPhone').value = hotel.other_contact_phone || '';
  document.getElementById('linkedIn').value = hotel.linkedin_url || '';

  hotelModal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal() {
  hotelModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// SAVE FORM SUBMISSION
hotelForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formErrorMsg.hidden = true;

  const originalId = document.getElementById('formIndex').value;
  const isEdit = originalId !== '';

  const cprRaw = document.getElementById('lastCprTraining').value.trim();
  const cprDatePattern = /^\d{4}-\d{2}-\d{2}$/;

  const starRatingRaw = document.getElementById('starRating').value;
  const estYearRaw = document.getElementById('establishmentYear').value.trim();

  const payload = {
    hotel_id: document.getElementById('hotelId').value.trim(),
    name: document.getElementById('hotelName').value.trim(),
    brand: document.getElementById('brand').value.trim(),
    group_name: document.getElementById('group').value.trim(),
    hospitality_group: document.getElementById('hospitalityGroup').value.trim(),
    category: document.getElementById('category').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    country: "India",
    star_rating: starRatingRaw ? parseInt(starRatingRaw, 10) : null,
    establishment_year: estYearRaw ? parseInt(estYearRaw, 10) : null,
    last_cpr_training: cprDatePattern.test(cprRaw) ? cprRaw : null,

    security_head_name: document.getElementById('secName').value.trim(),
    security_head_email: document.getElementById('secEmail').value.trim(),
    security_head_phone: document.getElementById('secPhone').value.trim(),
    security_head_linkedin: document.getElementById('secLinkedIn').value.trim(),

    general_manager_name: document.getElementById('gmName').value.trim(),
    general_manager_email: document.getElementById('gmEmail').value.trim(),
    general_manager_phone: document.getElementById('gmPhone').value.trim(),
    general_manager_linkedin: document.getElementById('gmLinkedIn').value.trim(),

    purchase_manager_name: document.getElementById('purName').value.trim(),
    purchase_manager_email: document.getElementById('purEmail').value.trim(),
    purchase_manager_phone: document.getElementById('purPhone').value.trim(),
    purchase_manager_linkedin: document.getElementById('purLinkedIn').value.trim(),

    other_contact_name: document.getElementById('othName').value.trim(),
    other_contact_email: document.getElementById('othEmail').value.trim(),
    other_contact_phone: document.getElementById('othPhone').value.trim(),
    linkedin_url: document.getElementById('linkedIn').value.trim(),
  };

  const originalLabel = saveHotelBtn.textContent;
  const viewerSubmission = isEdit && !isPrivileged();
  saveHotelBtn.disabled = true;
  saveHotelBtn.textContent = viewerSubmission ? 'Submitting...' : 'Saving...';
  cancelModalBtn.disabled = true;

  try {
    if (viewerSubmission) {
      // Nothing is written to the hotel record here — the server computes
      // its own diff against the live row and files it for admin/owner
      // review. Only the 16 contact fields are sent: the server rejects
      // anything else on this route, so sending them would just 403.
      const proposedChanges = {};
      CONTACT_FIELD_KEYS.forEach((k) => { proposedChanges[k] = payload[k]; });
      await request(`/hotels/${encodeURIComponent(originalId)}/edit-requests`, { method: 'POST', body: proposedChanges, auth: true });
      closeModal();
      toast('Thanks — your suggested changes have been sent to an admin for review.', { type: 'success' });
    } else if (isEdit) {
      await request(`/hotels/${encodeURIComponent(originalId)}`, { method: 'PUT', body: payload, auth: true });
      closeModal();
      await fetchHotels(currentPage);
    } else {
      await request('/hotels', { method: 'POST', body: payload, auth: true });
      closeModal();
      await fetchHotels(1);
    }
  } catch (err) {
    formErrorMsg.textContent = err.message;
    formErrorMsg.hidden = false;
  } finally {
    saveHotelBtn.disabled = false;
    saveHotelBtn.textContent = originalLabel;
    cancelModalBtn.disabled = false;
  }
});

// ============================================================
// SEARCH & FILTER
// ============================================================
function debouncedSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => fetchHotels(1), 300);
}

// Populates the Brand/City/State/Hospitality Group dropdowns from the
// real dataset instead of the old hardcoded sample options.
async function loadFilterOptions() {
  try {
    const { data } = await request('/hotels/meta/filters', { auth: true });
    // Batch into a fragment: these lists run to ~500 entries and were being
    // appended one node at a time.
    const populate = (select, values) => {
      const frag = document.createDocumentFragment();
      values.forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        frag.appendChild(option);
      });
      select.appendChild(frag);
    };
    populate(brandFilter, data.brands);
    populate(cityFilter, data.cities);
    populate(stateFilter, data.states);
    populate(hospitalityGroupFilter, data.hospitality_groups);

    // Ratings come from the data rather than a fixed 1-5 list: this dataset has
    // no 1-star properties at all, and 149 hotels with no rating recorded.
    const starFrag = document.createDocumentFragment();
    (data.star_ratings || []).forEach(({ value, count }) => {
      const option = document.createElement('option');
      if (value === null) {
        option.value = 'unrated';
        option.textContent = `Unrated (${count})`;
      } else {
        option.value = String(value);
        option.textContent = `${value} Star (${count})`;
      }
      starFrag.appendChild(option);
    });
    starFilter.appendChild(starFrag);

    // Kept for the City/State cascade below.
    cityStateMap = data.city_state || {};
    allCities = data.cities || [];
    stateCountryMap = data.state_country || {};
    allStates = data.states || [];
    populate(countryFilter, data.countries || []);

    // The form modal's Brand / Group / Category / City / State pickers offer
    // the same real values, so a typo can't invent a near-duplicate brand.
    formOptionSource = {
      brands: data.brands || [],
      groups: data.group_names || [],
      hospitality_groups: data.hospitality_groups || [],
      categories: data.categories || [],
      cities: data.cities || [],
      states: data.states || [],
    };

    setHeroStats(data);

    // Long lists (brand/city/state/group) become searchable. The underlying
    // <select> is untouched, so filtering logic carries on unchanged.
    [brandFilter, countryFilter, cityFilter, stateFilter, hospitalityGroupFilter, starFilter, contactFilter]
      .forEach((el) => window.enhanceSelect && window.enhanceSelect(el));
  } catch (err) {
    console.error('Could not load filter options:', err);
  }
}

// Rebuilds Brand / Hospitality Group / Star Rating to match the chosen
// Country+State+City. Without this the rail happily offers a brand that has
// no property in the selected region, which just returns an empty grid.
// A selection that the new scope invalidates is cleared rather than left
// applied invisibly — same rule the State/City cascade already follows.
async function syncScopedFilterOptions() {
  const params = new URLSearchParams();
  ['country', 'state', 'city'].forEach((key) => {
    const el = { country: countryFilter, state: stateFilter, city: cityFilter }[key];
    if (el && el.value && el.value !== 'all') params.set(key, el.value);
  });

  let data;
  try {
    ({ data } = await request(`/hotels/meta/filters?${params.toString()}`, { auth: true }));
  } catch (err) {
    console.error('Could not narrow filter options:', err);
    return;
  }

  const rebuild = (select, values, allLabel) => {
    const current = select.value;
    const stillValid = current === 'all' || values.includes(current);
    select.innerHTML = '';
    const all = document.createElement('option');
    all.value = 'all';
    all.textContent = allLabel;
    select.appendChild(all);
    const frag = document.createDocumentFragment();
    values.forEach((v) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = v;
      frag.appendChild(o);
    });
    select.appendChild(frag);
    select.value = stillValid ? current : 'all';
    select.dispatchEvent(new CustomEvent('combo:refresh'));
  };

  rebuild(brandFilter, data.brands || [], 'All Brands');
  rebuild(hospitalityGroupFilter, data.hospitality_groups || [], 'All Groups');

  // Star rating is value/count pairs rather than plain strings, so it gets
  // its own rebuild — the counts must reflect the narrowed scope too.
  const currentStar = starFilter.value;
  const starValues = (data.star_ratings || []).map(({ value }) => (value === null ? 'unrated' : String(value)));
  const starStillValid = currentStar === 'all' || starValues.includes(currentStar);
  starFilter.innerHTML = '';
  const allStars = document.createElement('option');
  allStars.value = 'all';
  allStars.textContent = 'All Ratings';
  starFilter.appendChild(allStars);
  const starFrag = document.createDocumentFragment();
  (data.star_ratings || []).forEach(({ value, count }) => {
    const option = document.createElement('option');
    option.value = value === null ? 'unrated' : String(value);
    option.textContent = value === null ? `Unrated (${count})` : `${value} Star (${count})`;
    starFrag.appendChild(option);
  });
  starFilter.appendChild(starFrag);
  starFilter.value = starStillValid ? currentStar : 'all';
  starFilter.dispatchEvent(new CustomEvent('combo:refresh'));
}

// Hero headline figures. Properties is the live row count, which equals the
// highest real Hotel ID (TH02274) — they are the same number by construction.
// Counts up from whatever the element currently shows (0 on first load,
// its prior value on a later refresh) rather than snapping straight to the
// new figure — the headline numbers otherwise just appeared, which read as
// static. Respects reduced-motion by skipping straight to the end value.
const REDUCE_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateCount(el, to, duration = 900) {
  if (!el || !Number.isFinite(to)) return;
  const fmt = new Intl.NumberFormat('en-IN');
  if (REDUCE_MOTION) { el.textContent = fmt.format(to); return; }

  const from = Number(el.textContent.replace(/[^0-9]/g, '')) || 0;
  if (from === to) { el.textContent = fmt.format(to); return; }

  if (el._countRaf) cancelAnimationFrame(el._countRaf);
  const start = performance.now();
  const easeOutCubic = (t) => 1 - (1 - t) ** 3;

  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const value = Math.round(from + (to - from) * easeOutCubic(t));
    el.textContent = fmt.format(value);
    if (t < 1) {
      el._countRaf = requestAnimationFrame(step);
    } else {
      delete el._countRaf;
    }
  };
  el._countRaf = requestAnimationFrame(step);
}

function setHeroStats(meta) {
  const put = (id, value) => {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) animateCount(el, value);
  };

  put('statCities', meta.cities && meta.cities.length);
  put('statBrands', meta.brands && meta.brands.length);

  // The raw `state` column mixes Indian states, union territories and foreign
  // regions ("Bagmati Province", "Greater London (UK)"). The server splits
  // them, so the headline no longer claims 41 Indian states.
  if (meta.region_counts) {
    put('statStates', meta.region_counts.indian_states);
    put('statUTs', meta.region_counts.union_territories);
  }
  put('statCountries', meta.countries && meta.countries.length);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
openAddModalBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);
closeDetailModalBtn.addEventListener('click', closeDetailModal);

searchInput.addEventListener('input', debouncedSearch);
contactFilter.addEventListener('change', () => fetchHotels(1));
starFilter.addEventListener('change', () => fetchHotels(1));
brandFilter.addEventListener('change', () => fetchHotels(1));
cityFilter.addEventListener('change', async () => {
  await syncScopedFilterOptions();
  fetchHotels(1);
});
// Must run the cascade before the fetch in both cases: a lower level filter
// left applied under a value it no longer belongs to would otherwise query
// an impossible combination and silently return zero results.
countryFilter.addEventListener('change', async () => {
  syncStateOptionsToCountry();
  syncCityOptionsToState();
  await syncScopedFilterOptions();
  fetchHotels(1);
});
stateFilter.addEventListener('change', async () => {
  syncCityOptionsToState();
  await syncScopedFilterOptions();
  fetchHotels(1);
});
hospitalityGroupFilter.addEventListener('change', () => fetchHotels(1));
sortByFilter.addEventListener('change', () => fetchHotels(1));
sortDirFilter.addEventListener('change', () => fetchHotels(1));

prevPageBtn.addEventListener('click', () => { if (currentPage > 1) fetchHotels(currentPage - 1); });
nextPageBtn.addEventListener('click', () => { if (currentPage < totalPages) fetchHotels(currentPage + 1); });

pageJumpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const n = parseInt(pageJumpInput.value, 10);
  if (!Number.isInteger(n) || n < 1 || n > totalPages) {
    pageJumpInput.value = '';
    pageJumpInput.focus();
    return;
  }
  fetchHotels(n);
});

pageSizeSelect.value = String(PAGE_SIZE);
pageSizeSelect.addEventListener('change', () => {
  PAGE_SIZE = parseInt(pageSizeSelect.value, 10);
  localStorage.setItem(PAGE_SIZE_KEY, String(PAGE_SIZE));
  fetchHotels(1);   // page count changes with page size, so land on page 1 rather than an index that may no longer exist
});

window.addEventListener('click', (e) => {
  if (e.target === hotelModal) closeModal();
  if (e.target === detailModal) closeDetailModal();
  if (e.target === accessRequestsModal) closeAccessRequestsModal();
  if (e.target === userMgmtModal) closeUserMgmtModal();
  if (e.target === editRequestsModal) closeEditRequestsModal();
});

// ============================================================
// USER MANAGEMENT MODAL (owner only)
// ============================================================
const userMgmtModal = document.getElementById('userMgmtModal');
const userMgmtAccountsPanel = document.getElementById('userMgmtAccounts');
const userMgmtActivityPanel = document.getElementById('userMgmtActivity');

function openUserMgmtModal() {
  userMgmtModal.classList.add('active');
  document.body.classList.add('modal-open');
  switchUserTab('accounts');
}

function closeUserMgmtModal() {
  userMgmtModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

document.getElementById('closeUserMgmtModalBtn').addEventListener('click', closeUserMgmtModal);
manageUsersBtn.addEventListener('click', openUserMgmtModal);

document.querySelectorAll('.user-tab').forEach((tab) => {
  tab.addEventListener('click', () => switchUserTab(tab.dataset.tab));
});

function switchUserTab(name) {
  document.querySelectorAll('.user-tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  userMgmtAccountsPanel.hidden = name !== 'accounts';
  userMgmtActivityPanel.hidden = name !== 'activity';
  if (name === 'accounts') loadUserAccounts();
  if (name === 'activity') loadUserActivity();
}

async function loadUserAccounts() {
  userMgmtAccountsPanel.innerHTML = '<p class="access-requests-empty">Loading...</p>';
  try {
    const { data } = await request('/users', { auth: true });
    if (data.length === 0) {
      userMgmtAccountsPanel.innerHTML = '<p class="access-requests-empty">No accounts found.</p>';
      return;
    }
    const currentEmail = getAuthUser()?.email;
    userMgmtAccountsPanel.innerHTML = data.map((u) => {
      const isSelf = u.email === currentEmail;
      const joined = new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const roleOptions = ['viewer', 'admin', 'owner']
        .map((r) => `<option value="${r}"${r === u.role ? ' selected' : ''}>${r}</option>`)
        .join('');
      const selfTag = isSelf ? ' <span style="color:var(--muted);font-weight:400;font-size:0.78rem;">(you)</span>' : '';
      // Owner accounts are immutable through this UI (and through the API that
      // backs it), so don't render controls that would only ever be rejected.
      const locked = isSelf || u.role === 'owner';
      const actions = locked
        ? (isSelf ? '' : '<span class="user-locked" title="Owner accounts can only be changed from the command line">protected</span>')
        : `
          <select class="role-select" data-action="role" title="Change role">${roleOptions}</select>
          <button class="btn btn-delete btn-sm" data-action="delete" style="padding:0.3rem 0.65rem;font-size:0.8rem;">&#x2715;</button>`;
      return `<div class="user-row" data-email="${escapeHtml(u.email)}">
          <div class="user-info">
            <div class="user-email">${escapeHtml(u.email)}${selfTag}</div>
            <div class="user-meta">Joined ${joined}</div>
          </div>
          <span class="role-badge ${u.role}">${u.role}</span>
          ${actions}
        </div>`;
    }).join('');

    userMgmtAccountsPanel.querySelectorAll('select[data-action="role"]').forEach((sel) => {
      const origValue = sel.value;
      sel.addEventListener('change', async () => {
        const row = sel.closest('.user-row');
        const email = row.dataset.email;
        const role = sel.value;
        try {
          await request(`/users/${encodeURIComponent(email)}/role`, { method: 'PATCH', body: { role }, auth: true });
          const badge = row.querySelector('.role-badge');
          badge.className = `role-badge ${role}`;
          badge.textContent = role;
        } catch (err) {
          toast(err.message);
          sel.value = origValue;
        }
      });
    });

    userMgmtAccountsPanel.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.user-row');
        const email = row.dataset.email;
        if (!confirm(`Delete account ${email}? This cannot be undone.`)) return;
        try {
          await request(`/users/${encodeURIComponent(email)}`, { method: 'DELETE', auth: true });
          row.remove();
        } catch (err) {
          toast(err.message);
        }
      });
    });
  } catch (err) {
    userMgmtAccountsPanel.innerHTML = `<p class="access-requests-empty" style="color:var(--danger);">${escapeHtml(err.message)}</p>`;
  }
}

async function loadUserActivity() {
  userMgmtActivityPanel.innerHTML = '<p class="access-requests-empty">Loading...</p>';
  try {
    const { data } = await request('/users/activity', { auth: true });
    if (data.length === 0) {
      userMgmtActivityPanel.innerHTML = '<p class="access-requests-empty">No activity recorded yet.</p>';
      return;
    }
    const rows = data.map((e) => {
      const when = new Date(e.occurred_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `<tr>
        <td>${escapeHtml(e.user_email || '\u2014')}</td>
        <td class="event-type">${escapeHtml(e.event_type)}</td>
        <td>${escapeHtml(e.hotel_id || '\u2014')}</td>
        <td style="color:var(--muted);">${escapeHtml(e.detail || '\u2014')}</td>
        <td style="white-space:nowrap;color:var(--muted);">${when}</td>
      </tr>`;
    }).join('');
    userMgmtActivityPanel.innerHTML = `<div style="overflow-x:auto;"><table class="activity-table">
      <thead><tr><th>User</th><th>Event</th><th>Hotel</th><th>Detail</th><th>When</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  } catch (err) {
    userMgmtActivityPanel.innerHTML = `<p class="access-requests-empty" style="color:var(--danger);">${escapeHtml(err.message)}</p>`;
  }
}

// ============================================================
// EDIT REQUESTS MODAL (admin/owner) — reviews viewer-submitted hotel edits
// ============================================================
const editRequestsModal = document.getElementById('editRequestsModal');
const editRequestsList = document.getElementById('editRequestsList');

function openEditRequestsModal() {
  editRequestsModal.classList.add('active');
  document.body.classList.add('modal-open');
  loadEditRequests();
}

function closeEditRequestsModal() {
  editRequestsModal.classList.remove('active');
  document.body.classList.remove('modal-open');
}

document.getElementById('closeEditRequestsModalBtn').addEventListener('click', closeEditRequestsModal);
editRequestsBtn.addEventListener('click', openEditRequestsModal);

// Human-readable labels for the raw column names in a diff.
const FIELD_LABELS = {
  security_head_name: 'Security Head — Name', security_head_email: 'Security Head — Email',
  security_head_phone: 'Security Head — Phone', security_head_linkedin: 'Security Head — LinkedIn',
  general_manager_name: 'General Manager — Name', general_manager_email: 'General Manager — Email',
  general_manager_phone: 'General Manager — Phone', general_manager_linkedin: 'General Manager — LinkedIn',
  purchase_manager_name: 'Purchase Manager — Name', purchase_manager_email: 'Purchase Manager — Email',
  purchase_manager_phone: 'Purchase Manager — Phone', purchase_manager_linkedin: 'Purchase Manager — LinkedIn',
  other_contact_name: 'Other Contact — Name', other_contact_email: 'Other Contact — Email',
  other_contact_phone: 'Other Contact — Phone', linkedin_url: 'Other Contact — LinkedIn',
  name: 'Hotel Name', brand: 'Brand', group_name: 'Group', hospitality_group: 'Hospitality Group',
  category: 'Category', city: 'City', state: 'State', star_rating: 'Star Rating',
  establishment_year: 'Establishment Year', last_cpr_training: 'Last CPR Training',
};

async function refreshEditRequestsBadge() {
  try {
    const { data } = await request('/edit-requests?status=pending', { auth: true });
    editRequestsBadge.hidden = data.length === 0;
    editRequestsBadge.textContent = data.length;
  } catch (err) {
    // Non-fatal — the badge just stays at whatever it last showed.
  }
}

async function loadEditRequests() {
  editRequestsList.innerHTML = '<p class="access-requests-empty">Loading...</p>';
  try {
    const { data } = await request('/edit-requests?status=pending', { auth: true });
    if (data.length === 0) {
      editRequestsList.innerHTML = '<p class="access-requests-empty">No pending edit requests.</p>';
      return;
    }

    editRequestsList.innerHTML = data.map((r) => {
      const rows = Object.entries(r.changes).map(([field, { from, to }]) => `
        <tr>
          <td>${escapeHtml(FIELD_LABELS[field] || field)}</td>
          <td class="diff-from">${isValidValue(from) ? escapeHtml(from) : '<em>empty</em>'}</td>
          <td class="diff-to">${isValidValue(to) ? escapeHtml(to) : '<em>empty</em>'}</td>
        </tr>`).join('');

      const when = new Date(r.requested_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

      return `
        <div class="edit-request-card" data-id="${r.id}">
          <div class="edit-request-head">
            <div>
              <strong>${escapeHtml(r.hotel_name || r.hotel_id)}</strong>
              <span class="card-id">${escapeHtml(r.hotel_id)}</span>
            </div>
            <div class="edit-request-meta">Submitted by ${escapeHtml(r.requested_by_email)} · ${when}</div>
          </div>
          <table class="diff-table">
            <thead><tr><th>Field</th><th>Current</th><th>Proposed</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="edit-request-actions">
            <button type="button" class="btn btn-delete btn-sm" data-action="reject">Reject</button>
            <button type="button" class="btn btn-primary btn-sm" data-action="approve">Approve</button>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    editRequestsList.innerHTML = `<p class="access-requests-empty" style="color:var(--danger);">${escapeHtml(err.message)}</p>`;
  }
}

editRequestsList.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const card = btn.closest('.edit-request-card');
  const id = card.dataset.id;
  const action = btn.dataset.action;

  let rejectNote;
  if (action === 'reject') {
    // null = user hit Cancel on the prompt entirely, which should abort the
    // whole reject — distinct from submitting an empty string for "no note".
    rejectNote = prompt('Optional note for the submitter (why was this rejected?):', '');
    if (rejectNote === null) return;
  }

  const buttons = card.querySelectorAll('button');
  buttons.forEach((b) => { b.disabled = true; });

  try {
    if (action === 'approve') {
      await request(`/edit-requests/${encodeURIComponent(id)}/approve`, { method: 'POST', auth: true });
    } else {
      await request(`/edit-requests/${encodeURIComponent(id)}/reject`, { method: 'POST', auth: true, body: rejectNote ? { note: rejectNote } : {} });
    }
    card.remove();
    if (!editRequestsList.querySelector('.edit-request-card')) {
      editRequestsList.innerHTML = '<p class="access-requests-empty">No pending edit requests.</p>';
    }
    refreshEditRequestsBadge();
    // The change is now live (if approved) — refresh whatever's on screen.
    await fetchHotels(currentPage);
  } catch (err) {
    toast(`Could not ${action} this request: ${err.message}`);
    buttons.forEach((b) => { b.disabled = false; });
  }
});

// ============================================================
function loadAppData() {
  loadFilterOptions();
  initFormPickers();
  fetchHotels(1);
  refreshMyAccessRequestStatus();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!getAuthToken()) {
    // A cold, never-signed-in visit goes to the marketing landing page, not
    // straight to the sign-in form — about.html is where "Sign In" and
    // "Create Account" actually live now. A session that expired mid-use
    // (see request()'s 401 handling) still goes straight back to
    // login.html via redirectToLogin(); that's a returning user, not a
    // first visit, and shouldn't be shown the landing page again.
    window.location.replace('about.html');
    return;
  }
  updateAuthUI();
  loadAppData();
});

// ============================================================
// UI SHELL — filters state, user menu, drawer, view mode, shortcuts
// ============================================================
const FILTER_CONTROLS = [contactFilter, starFilter, brandFilter, countryFilter, stateFilter, cityFilter, hospitalityGroupFilter];

const railEl = document.getElementById('filterRail');
const railScrim = document.getElementById('railScrim');
const railOpenBtn = document.getElementById('railOpenBtn');
const railCloseBtn = document.getElementById('railCloseBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const toolbarClearBtn = document.getElementById('toolbarClearBtn');
const filterCountBadge = document.getElementById('filterCountBadge');
const railActiveCount = document.getElementById('railActiveCount');
const searchClearBtn = document.getElementById('searchClearBtn');
const searchFieldEl = document.getElementById('searchField');
const userMenuBtn = document.getElementById('userMenuBtn');
const userMenuPanel = document.getElementById('userMenuPanel');
const userAvatar = document.getElementById('userAvatar');
const viewGridBtn = document.getElementById('viewGridBtn');
const viewListBtn = document.getElementById('viewListBtn');
const heroEyebrow = document.getElementById('heroEyebrow');

function hasActiveQuery() {
  return activeFilterCount() > 0 || searchInput.value.trim().length > 0;
}

// Country -> State -> City cascade -------------------------------------------
let cityStateMap = {};
let allCities = [];
let stateCountryMap = {};
let allStates = [];

// Rebuild the State options to match the chosen Country. A state selected
// under a different country is cleared rather than left applied invisibly,
// which would silently return zero results.
function syncStateOptionsToCountry() {
  const country = countryFilter.value;
  const wanted = country === 'all'
    ? allStates
    : allStates.filter((s) => stateCountryMap[s] === country);

  const current = stateFilter.value;
  const stillValid = current === 'all' || wanted.includes(current);

  stateFilter.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = country === 'all' ? 'All States' : `All States in ${country}`;
  stateFilter.appendChild(all);

  const frag = document.createDocumentFragment();
  wanted.forEach((s) => {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s;
    frag.appendChild(o);
  });
  stateFilter.appendChild(frag);

  stateFilter.value = stillValid ? current : 'all';
  stateFilter.dispatchEvent(new CustomEvent('combo:refresh'));
  return !stillValid;
}

// Rebuild the City options to match the chosen State. A city selected under a
// different state is cleared rather than left applied invisibly, which would
// silently return zero results.
function syncCityOptionsToState() {
  const state = stateFilter.value;
  const country = countryFilter.value;

  // Narrow to the most specific scope actually chosen. State wins when set;
  // otherwise fall back to the country, via city -> state -> country. Without
  // that fallback, picking a country and leaving State on "all" left the full
  // global city list showing — Indian cities offered under Bhutan.
  let wanted;
  let scopeLabel = '';
  if (state !== 'all') {
    wanted = allCities.filter((c) => cityStateMap[c] === state);
    scopeLabel = state;
  } else if (country !== 'all') {
    wanted = allCities.filter((c) => stateCountryMap[cityStateMap[c]] === country);
    scopeLabel = country;
  } else {
    wanted = allCities;
  }

  const current = cityFilter.value;
  const stillValid = current === 'all' || wanted.includes(current);

  cityFilter.innerHTML = '';
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = scopeLabel ? `All Cities in ${scopeLabel}` : 'All Cities';
  cityFilter.appendChild(all);

  const frag = document.createDocumentFragment();
  wanted.forEach((c) => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    frag.appendChild(o);
  });
  cityFilter.appendChild(frag);

  cityFilter.value = stillValid ? current : 'all';
  cityFilter.dispatchEvent(new CustomEvent('combo:refresh'));
  return !stillValid;      // caller needs to know the city was dropped
}

function activeFilterCount() {
  const base = FILTER_CONTROLS.filter((el) => el && el.value !== 'all').length;
  return base + (favouritesOnlyToggle.checked ? 1 : 0) + (upcomingOnlyToggle.checked ? 1 : 0);
}

// Keeps the badge, the "N filters active" line, the Clear all button and the
// highlight on each control in sync from one place.
function syncFilterState() {
  const n = activeFilterCount();

  FILTER_CONTROLS.forEach((el) => {
    if (el) el.classList.toggle('is-active', el.value !== 'all');
  });
  favouritesOnlyToggle.closest('.favtoggle').classList.toggle('is-active', favouritesOnlyToggle.checked);
  upcomingOnlyToggle.closest('.favtoggle').classList.toggle('is-active', upcomingOnlyToggle.checked);

  filterCountBadge.hidden = n === 0;
  filterCountBadge.textContent = n;
  clearFiltersBtn.hidden = n === 0;
  toolbarClearBtn.hidden = n === 0;
  railActiveCount.hidden = n === 0;
  railActiveCount.textContent = n === 1 ? '1 filter active' : `${n} filters active`;
}

function clearAllFilters() {
  FILTER_CONTROLS.forEach((el) => { if (el) el.value = 'all'; });
  // Restore the full state/city lists, then tell every combobox to repaint
  // its label. Without this the rail still displayed the old selections
  // after a reset.
  syncStateOptionsToCountry();
  syncCityOptionsToState();
  FILTER_CONTROLS.forEach((el) => el && el.dispatchEvent(new CustomEvent('combo:refresh')));
  if (favouritesOnlyToggle.checked) {
    favouritesOnlyToggle.checked = false;
  }
  if (upcomingOnlyToggle.checked) {
    upcomingOnlyToggle.checked = false;
  }
  syncFilterState();
  fetchHotels(1);
}

clearFiltersBtn.addEventListener('click', clearAllFilters);
toolbarClearBtn.addEventListener('click', clearAllFilters);
FILTER_CONTROLS.forEach((el) => el && el.addEventListener('change', syncFilterState));
favouritesOnlyToggle.addEventListener('change', () => {
  syncFilterState();
  fetchHotels(1);
});
upcomingOnlyToggle.addEventListener('change', () => {
  syncFilterState();
  fetchHotels(1);
});

// --- Filter drawer (tablet / mobile) ---------------------------------------
function openRail() {
  railEl.classList.add('is-open');
  railScrim.hidden = false;
  document.body.style.overflow = 'hidden';
  railCloseBtn.focus();
}
function closeRail() {
  railEl.classList.remove('is-open');
  railScrim.hidden = true;
  document.body.style.overflow = '';
  railOpenBtn.focus();
}
railOpenBtn.addEventListener('click', openRail);
railCloseBtn.addEventListener('click', closeRail);
railScrim.addEventListener('click', closeRail);

// --- Search affordances -----------------------------------------------------
function syncSearchClear() {
  searchClearBtn.hidden = searchInput.value.length === 0;
}
searchInput.addEventListener('input', syncSearchClear);
searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  syncSearchClear();
  searchInput.focus();
  fetchHotels(1);
});

// "/" focuses search, the way it works in most developer tooling.
document.addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if (e.key === '/' && !typing && !document.querySelector('.modal-overlay.active')) {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    if (railEl.classList.contains('is-open')) closeRail();
    if (!userMenuPanel.hidden) closeUserMenu();
  }
});

// --- User menu --------------------------------------------------------------
function openUserMenu() {
  userMenuPanel.hidden = false;
  userMenuBtn.setAttribute('aria-expanded', 'true');
}
function closeUserMenu() {
  userMenuPanel.hidden = true;
  userMenuBtn.setAttribute('aria-expanded', 'false');
}
userMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  userMenuPanel.hidden ? openUserMenu() : closeUserMenu();
});
document.addEventListener('click', (e) => {
  if (!userMenuPanel.hidden && !userMenuPanel.contains(e.target) && e.target !== userMenuBtn) {
    closeUserMenu();
  }
});

// --- View mode (persisted) --------------------------------------------------
const VIEW_KEY = 'thinkhealth_view_mode';

function applyViewMode(mode) {
  const list = mode === 'list';
  hotelGrid.classList.toggle('is-list', list);
  viewListBtn.classList.toggle('is-active', list);
  viewGridBtn.classList.toggle('is-active', !list);
  viewListBtn.setAttribute('aria-pressed', String(list));
  viewGridBtn.setAttribute('aria-pressed', String(!list));
  localStorage.setItem(VIEW_KEY, mode);
}
viewGridBtn.addEventListener('click', () => applyViewMode('grid'));
viewListBtn.addEventListener('click', () => applyViewMode('list'));

// --- Hero property count reflects the real dataset --------------------------
// Replaces the figure that used to be hardcoded in the markup.
function setHeroCount(total) {
  animateCount(document.getElementById('statProperties'), total);
}

// --- Hero scroll cue --------------------------------------------------------
// Driven explicitly rather than relying on the anchor's default jump: the hash
// only changes on the first activation, so a second click did nothing, and the
// native behaviour ignores prefers-reduced-motion.
const heroScrollBtn = document.getElementById('heroScrollBtn');
if (heroScrollBtn) {
  heroScrollBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('mainContent');
    if (!target) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    // Move focus so keyboard users land in the directory, not back at the top.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

// --- Sort slider: collapsed toggle that opens the pill rows on demand ------
const sortToggleBtn = document.getElementById('sortToggleBtn');
const sortToggleLabel = document.getElementById('sortToggleLabel');
const sortSliderPanel = document.getElementById('sortSliderPanel');

function closeSortSlider() {
  sortSliderPanel.hidden = true;
  sortToggleBtn.setAttribute('aria-expanded', 'false');
  document.removeEventListener('click', onOutsideSortSlider, true);
}
function openSortSlider() {
  sortSliderPanel.hidden = false;
  sortToggleBtn.setAttribute('aria-expanded', 'true');
  document.addEventListener('click', onOutsideSortSlider, true);
}
function onOutsideSortSlider(e) {
  if (!sortSliderPanel.contains(e.target) && e.target !== sortToggleBtn && !sortToggleBtn.contains(e.target)) {
    closeSortSlider();
  }
}
sortToggleBtn.addEventListener('click', () => {
  if (sortSliderPanel.hidden) openSortSlider(); else closeSortSlider();
});

function syncSortToggleLabel() {
  const sortOpt = sortByFilter.options[sortByFilter.selectedIndex];
  const dirOpt = sortDirFilter.options[sortDirFilter.selectedIndex];
  sortToggleLabel.textContent = `${sortOpt.textContent} · ${dirOpt.textContent}`;
}
sortByFilter.addEventListener('change', syncSortToggleLabel);
sortDirFilter.addEventListener('change', syncSortToggleLabel);

// --- Boot -------------------------------------------------------------------
applyViewMode(localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid');
syncFilterState();
syncSearchClear();
buildPillGroup(sortByFilter, document.getElementById('sortByPills'));
buildPillGroup(sortDirFilter, document.getElementById('sortDirPills'));
syncSortToggleLabel();

// Footer copyright year — set from the clock so it never goes stale.
const footerYearEl = document.getElementById('footerYear');
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
