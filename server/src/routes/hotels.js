const express = require('express');
const { pool } = require('../db');
const { normalizeHotelId, validateHotelInput } = require('../validation');
const { requireRole } = require('../middleware/auth');
const { classifyRegion } = require('../regions');
const { logAuditEvent } = require('../audit');

const router = express.Router();

// Maps API field names (snake_case, matching the DB) to columns.
// Whitelisted explicitly — never build column lists from raw request keys.
const WRITABLE_FIELDS = [
  'hotel_id', 'name', 'brand', 'group_name', 'establishment_year', 'star_rating',
  'hospitality_group', 'city', 'state', 'country', 'category',
  'security_head_name', 'security_head_email', 'security_head_phone', 'security_head_linkedin',
  'general_manager_name', 'general_manager_email', 'general_manager_phone', 'general_manager_linkedin',
  'purchase_manager_name', 'purchase_manager_email', 'purchase_manager_phone', 'purchase_manager_linkedin',
  'other_contact_name', 'other_contact_email', 'other_contact_phone',
  'linkedin_url', 'last_cpr_training',
];

// On-site safety/medical items. Keys are stable and stored in hotels.products;
// the labels live in the front end. Extend this list to add an item — nothing
// here is per-item, so no migration is needed.
const PRODUCT_KEYS = [
  'aed', 'stretcher', 'wheelchair', 'first_aid_kit', 'oxygen_cylinder', 'spine_board',
];

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

// Whitelisted sort columns — never build ORDER BY from raw query input.
const SORT_COLUMNS = {
  hotel_id: 'hotel_id',
  name: 'name',
  brand: 'brand',
  establishment_year: 'establishment_year',
  star_rating: 'star_rating',
  city: 'city',
  state: 'state',
};

// The 16 contact fields: four roles x (name, email, phone, linkedin).
// Note the last one — the "other" contact's LinkedIn column is `linkedin_url`,
// not `other_contact_linkedin`. That inconsistency is historical and easy to
// miss, which would silently make the completeness count 15 instead of 16.
const CONTACT_FIELDS = [
  'security_head_name', 'security_head_email', 'security_head_phone', 'security_head_linkedin',
  'general_manager_name', 'general_manager_email', 'general_manager_phone', 'general_manager_linkedin',
  'purchase_manager_name', 'purchase_manager_email', 'purchase_manager_phone', 'purchase_manager_linkedin',
  'other_contact_name', 'other_contact_email', 'other_contact_phone', 'linkedin_url',
];

// A hotel counts as reachable if ANY of those 16 is populated — the same rule
// the card badge applies, so filter and label can never disagree.
const HAS_ANY_CONTACT = CONTACT_FIELDS
  .map((c) => `(${c} IS NOT NULL AND ${c} <> '')`)
  .join(' OR ');

function isUniqueViolation(err) {
  return err && err.code === '23505';
}

// Blank strings from the edit form mean "clear this field" — store NULL,
// not '', so hasContactInfo-style NULL checks (and the DB column semantics
// generally) stay consistent with what the import script writes.
function nullifyBlank(value) {
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

// GET /api/hotels — paginated list with search/filter
router.get('/', requireRole(), async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const offset = (page - 1) * limit;

    const conditions = ['deleted_at IS NULL'];
    const params = [];

    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      const idx = params.length;
      conditions.push(`(name ILIKE $${idx} OR city ILIKE $${idx} OR brand ILIKE $${idx} OR hotel_id ILIKE $${idx})`);
    }
    if (req.query.star_rating === 'unrated') {
      // 149 properties have no rating recorded; they need to be findable.
      conditions.push('star_rating IS NULL');
    } else if (req.query.star_rating) {
      params.push(req.query.star_rating);
      conditions.push(`star_rating::text = $${params.length}`);
    }
    if (req.query.brand) {
      params.push(req.query.brand);
      conditions.push(`brand ILIKE $${params.length}`);
    }
    if (req.query.country) {
      params.push(req.query.country);
      conditions.push(`country ILIKE $${params.length}`);
    }
    if (req.query.city) {
      params.push(req.query.city);
      conditions.push(`city ILIKE $${params.length}`);
    }
    if (req.query.state) {
      params.push(req.query.state);
      conditions.push(`state ILIKE $${params.length}`);
    }
    if (req.query.hotel_ids) {
      // Favourites live in the browser's localStorage, not the database, so
      // "show only saved hotels" is expressed as an explicit id list rather
      // than a column filter. Kept server-side (not client-side slicing of a
      // page) so it composes correctly with sort, search and pagination.
      const ids = req.query.hotel_ids.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 500);
      if (ids.length === 0) {
        // An empty favourites list must return zero rows, not "no filter".
        conditions.push('FALSE');
      } else {
        params.push(ids);
        conditions.push(`hotel_id = ANY($${params.length})`);
      }
    }
    if (req.query.hospitality_group) {
      params.push(req.query.hospitality_group);
      conditions.push(`hospitality_group ILIKE $${params.length}`);
    }
    // "Upcoming" = an establishment year still in the future. Compared against
    // the database's own clock rather than a year passed in by the client, so
    // it can't drift or be spoofed.
    if (req.query.upcoming === 'true') {
      conditions.push(`establishment_year > EXTRACT(YEAR FROM now())`);
    }
    const contactStatus = req.query.contact_status;
    // Two states only: something recorded, or nothing at all.
    if (contactStatus === 'available' || contactStatus === 'present') {
      conditions.push(`(${HAS_ANY_CONTACT})`);
    } else if (contactStatus === 'none' || contactStatus === 'missing') {
      conditions.push(`NOT (${HAS_ANY_CONTACT})`);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const sortColumn = SORT_COLUMNS[req.query.sort_by] || SORT_COLUMNS.name;
    const sortDir = req.query.sort_dir === 'desc' ? 'DESC' : 'ASC';

    const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM hotels ${where}`, params);
    const total = countResult.rows[0].total;

    params.push(limit);
    params.push(offset);
    const dataResult = await pool.query(
      `SELECT * FROM hotels ${where} ORDER BY ${sortColumn} ${sortDir} NULLS LAST, name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hotels/meta/filters — distinct values to populate filter
// dropdowns. Must be registered before /:hotel_id so "meta" isn't parsed
// as a hotel_id.
router.get('/meta/filters', requireRole(), async (req, res, next) => {
  try {
    // Optional geographic scope. When a country/state/city is supplied, the
    // Brand / Group / Star lists narrow to what actually exists inside that
    // scope, so the rail can't offer a combination that returns nothing.
    // The geographic lists themselves stay unscoped — they drive the
    // Country -> State -> City cascade, which is resolved client-side.
    const scope = [];
    const scopeParams = [];
    ['country', 'state', 'city'].forEach((key) => {
      const value = (req.query[key] || '').toString().trim();
      if (value && value !== 'all') {
        scopeParams.push(value);
        scope.push(`${key} = $${scopeParams.length}`);
      }
    });
    const scopeWhere = scope.length > 0 ? `AND ${scope.join(' AND ')}` : '';

    const [brands, cities, states, hospitalityGroups, starRatings, countries, groupNames, categories] = await Promise.all([
      pool.query(`SELECT DISTINCT brand FROM hotels
                   WHERE brand IS NOT NULL AND deleted_at IS NULL ${scopeWhere} ORDER BY brand`, scopeParams),
      // City carries its state so the City filter can narrow to the selected
      // State. Every city in this dataset belongs to exactly one state, so a
      // flat map is sufficient — verified, no city spans two states.
      pool.query(`SELECT DISTINCT city, state FROM hotels
                   WHERE city IS NOT NULL AND deleted_at IS NULL ORDER BY city`),
      // State carries its country for the Country -> State -> City cascade.
      // Verified: every state maps to exactly one country in this dataset.
      pool.query(`SELECT DISTINCT state, country FROM hotels
                   WHERE state IS NOT NULL AND deleted_at IS NULL ORDER BY state`),
      pool.query(`SELECT DISTINCT hospitality_group FROM hotels
                   WHERE hospitality_group IS NOT NULL AND deleted_at IS NULL ${scopeWhere}
                   ORDER BY hospitality_group`, scopeParams),
      // Driven by the data: the list was hardcoded to 5/4/3, which hid the
      // 2-star properties entirely and offered a 1-star option that matches
      // nothing. Counts come back too so the UI can label each option.
      pool.query(`SELECT star_rating, COUNT(*)::int AS count
                    FROM hotels
                   WHERE deleted_at IS NULL ${scopeWhere}
                   GROUP BY star_rating
                   ORDER BY star_rating DESC NULLS LAST`, scopeParams),
      pool.query(`SELECT DISTINCT country FROM hotels
                   WHERE country IS NOT NULL AND country <> '' AND deleted_at IS NULL
                   ORDER BY country`),
      // Not filter-rail lists — these back the form modal's pickers, so an
      // editor picks an existing Management Group / Category instead of
      // typing a near-duplicate of one that already exists.
      pool.query(`SELECT DISTINCT group_name FROM hotels
                   WHERE group_name IS NOT NULL AND group_name <> '' AND deleted_at IS NULL
                   ORDER BY group_name`),
      pool.query(`SELECT DISTINCT category FROM hotels
                   WHERE category IS NOT NULL AND category <> '' AND deleted_at IS NULL
                   ORDER BY category`),
    ]);

    // The state column mixes Indian states, Indian union territories and
    // foreign regions, so a single "states" count was misleading. Split them.
    const regionCounts = { state: 0, union_territory: 0, foreign: 0 };
    states.rows.forEach((r) => { regionCounts[classifyRegion(r.state)] += 1; });

    res.json({
      data: {
        brands: brands.rows.map((r) => r.brand),
        cities: cities.rows.map((r) => r.city),
        city_state: Object.fromEntries(
          cities.rows.filter((r) => r.state).map((r) => [r.city, r.state])
        ),
        states: states.rows.map((r) => r.state),
        state_country: Object.fromEntries(
          states.rows.filter((r) => r.country).map((r) => [r.state, r.country])
        ),
        hospitality_groups: hospitalityGroups.rows.map((r) => r.hospitality_group),
        star_ratings: starRatings.rows.map((r) => ({ value: r.star_rating, count: r.count })),
        countries: countries.rows.map((r) => r.country),
        group_names: groupNames.rows.map((r) => r.group_name),
        categories: categories.rows.map((r) => r.category),
        region_counts: {
          indian_states: regionCounts.state,
          union_territories: regionCounts.union_territory,
          foreign_regions: regionCounts.foreign,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hotels/meta/next-id — the next unused TH##### in sequence.
// Derived server-side from the real max, so two people adding a hotel at the
// same time can't both be handed the same id from a stale client cache.
// Registered before /:hotel_id so "meta" isn't parsed as a hotel_id.
router.get('/meta/next-id', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    // Lowest unused number rather than MAX+1: a single stray high id (a test
    // record, a typo) would otherwise push every future id into the 99000s.
    // Soft-deleted rows keep their hotel_id under the unique constraint, so
    // they are counted here too — skipping them would cause a collision.
    const { rows } = await pool.query(
      `SELECT COALESCE(MIN(s.n), 1) AS next_seq
         FROM generate_series(
                1,
                (SELECT COUNT(*) + 1 FROM hotels WHERE hotel_id ~ '^TH[0-9]+$')
              ) AS s(n)
        WHERE NOT EXISTS (
                SELECT 1 FROM hotels
                 WHERE hotel_id = 'TH' || LPAD(s.n::text, 5, '0')
              )`
    );
    const next = rows[0].next_seq;
    res.json({ data: { hotel_id: `TH${String(next).padStart(5, '0')}` } });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/hotels/:hotel_id/products — admin/owner. Kept as its own route
// rather than folded into PUT: the detail modal ticks a box and saves that
// one thing, and shouldn't have to round-trip the whole record to do it.
router.patch('/:hotel_id/products', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const hotelId = normalizeHotelId(req.params.hotel_id);
    const submitted = Array.isArray(req.body.products) ? req.body.products : null;
    if (!submitted) {
      return res.status(400).json({ error: 'products must be an array.' });
    }

    // Whitelist, dedupe, and keep the canonical order — never store whatever
    // string the client happened to send.
    const products = PRODUCT_KEYS.filter((k) => submitted.includes(k));

    const result = await pool.query(
      `UPDATE hotels SET products = $1 WHERE hotel_id = $2 AND deleted_at IS NULL
       RETURNING hotel_id, products`,
      [JSON.stringify(products), hotelId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Hotel ${hotelId} not found.` });
    }

    await logAuditEvent({
      eventType: 'hotel_products_update',
      userEmail: req.user.email,
      hotelId,
      detail: products.length ? products.join(', ') : '(none)',
    });

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/hotels/:hotel_id
router.get('/:hotel_id', requireRole(), async (req, res, next) => {
  try {
    const hotelId = normalizeHotelId(req.params.hotel_id);
    const result = await pool.query(
      'SELECT * FROM hotels WHERE hotel_id = $1 AND deleted_at IS NULL',
      [hotelId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Hotel ${hotelId} not found.` });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/hotels — AUTH REQUIRED (admin or owner)
router.post('/', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const errors = validateHotelInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    const hotelId = normalizeHotelId(req.body.hotel_id);

    const existing = await pool.query('SELECT 1 FROM hotels WHERE hotel_id = $1', [hotelId]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: `Hotel ID ${hotelId} already exists.` });
    }

    const columns = ['hotel_id', ...WRITABLE_FIELDS.filter((f) => f !== 'hotel_id' && req.body[f] !== undefined)];
    const values = columns.map((col) => (col === 'hotel_id' ? hotelId : nullifyBlank(req.body[col])));
    const placeholders = values.map((_, i) => `$${i + 1}`);

    const result = await pool.query(
      `INSERT INTO hotels (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );

    await logAuditEvent({ eventType: 'hotel_create', userEmail: req.user.email, hotelId: result.rows[0].hotel_id });
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: `Hotel ID ${normalizeHotelId(req.body.hotel_id)} already exists.` });
    }
    next(err);
  }
});

// PUT /api/hotels/:hotel_id — AUTH REQUIRED (admin or owner)
router.put('/:hotel_id', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const currentHotelId = normalizeHotelId(req.params.hotel_id);

    const errors = validateHotelInput(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    const existing = await pool.query(
      'SELECT * FROM hotels WHERE hotel_id = $1 AND deleted_at IS NULL',
      [currentHotelId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: `Hotel ${currentHotelId} not found.` });
    }

    // Allow the record to keep its own hotel_id; reject only a collision with a *different* hotel.
    let newHotelId = currentHotelId;
    if (req.body.hotel_id !== undefined) {
      newHotelId = normalizeHotelId(req.body.hotel_id);
      if (newHotelId !== currentHotelId) {
        const collision = await pool.query('SELECT 1 FROM hotels WHERE hotel_id = $1', [newHotelId]);
        if (collision.rows.length > 0) {
          return res.status(409).json({ error: `Hotel ID ${newHotelId} already exists.` });
        }
      }
    }

    const fieldsToUpdate = WRITABLE_FIELDS.filter((f) => f !== 'hotel_id' && req.body[f] !== undefined);
    const columns = ['hotel_id', ...fieldsToUpdate];
    const values = [newHotelId, ...fieldsToUpdate.map((f) => nullifyBlank(req.body[f]))];
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE hotels SET ${setClause} WHERE hotel_id = $${columns.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, currentHotelId]
    );

    await logAuditEvent({ eventType: 'hotel_update', userEmail: req.user.email, hotelId: result.rows[0].hotel_id });
    res.json({ data: result.rows[0] });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return res.status(409).json({ error: `Hotel ID ${normalizeHotelId(req.body.hotel_id)} already exists.` });
    }
    next(err);
  }
});

// DELETE /api/hotels/:hotel_id — AUTH REQUIRED (admin or owner, soft delete)
router.delete('/:hotel_id', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const hotelId = normalizeHotelId(req.params.hotel_id);
    const result = await pool.query(
      `UPDATE hotels SET deleted_at = now() WHERE hotel_id = $1 AND deleted_at IS NULL RETURNING hotel_id`,
      [hotelId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Hotel ${hotelId} not found.` });
    }

    await logAuditEvent({ eventType: 'hotel_delete', userEmail: req.user.email, hotelId });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/hotels/:hotel_id/edit-requests — any signed-in user, viewers
// included. Viewers can't write to `hotels` directly (the write routes above
// all require admin/owner) but they're frequently the ones who actually know
// a contact changed, so this lets them propose it. Nothing touches `hotels`
// here — the diff is computed against the live record and stored as its own
// row, and only takes effect if an admin/owner later approves it.
router.post('/:hotel_id/edit-requests', requireRole(), async (req, res, next) => {
  try {
    const hotelId = normalizeHotelId(req.params.hotel_id);

    const existing = await pool.query(
      'SELECT * FROM hotels WHERE hotel_id = $1 AND deleted_at IS NULL',
      [hotelId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: `Hotel ${hotelId} not found.` });
    }
    const hotel = existing.rows[0];

    const errors = validateHotelInput(req.body, { partial: true });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed.', details: errors });
    }

    // This route proposes *contact* corrections only. A hotel's identity and
    // classification (name, brand, city, star rating, ...) are admin/owner
    // territory via PUT — a viewer proposing a rename or a re-classification
    // isn't a content correction, and it would collide at approval time.
    // Enforced here, not only in the UI: the disabled inputs are a courtesy,
    // this is the actual boundary.
    const forbidden = Object.keys(req.body).filter(
      (f) => WRITABLE_FIELDS.includes(f) && !CONTACT_FIELDS.includes(f)
    );
    if (forbidden.length > 0) {
      return res.status(403).json({
        error: `Edit requests may only change contact details. Not editable here: ${forbidden.join(', ')}.`,
      });
    }

    const changes = {};
    CONTACT_FIELDS.forEach((field) => {
      if (req.body[field] === undefined) return;
      const to = nullifyBlank(req.body[field]);
      const from = hotel[field] === undefined ? null : hotel[field];
      // Only fields that actually differ end up in the diff — a reviewer
      // should see what changed, not a restatement of the whole record.
      if (String(from ?? '') !== String(to ?? '')) {
        changes[field] = { from, to };
      }
    });

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No changes to submit — nothing differs from the current record.' });
    }

    const result = await pool.query(
      `INSERT INTO hotel_edit_requests (hotel_id, requested_by_email, changes)
       VALUES ($1, $2, $3) RETURNING *`,
      [hotelId, req.user.email, JSON.stringify(changes)]
    );

    await logAuditEvent({
      eventType: 'hotel_edit_requested',
      userEmail: req.user.email,
      hotelId,
      detail: `Proposed changes to: ${Object.keys(changes).join(', ')}`,
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
