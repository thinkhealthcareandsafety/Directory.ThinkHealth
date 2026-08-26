// Review queue for viewer-submitted hotel edits. Creation (POST
// /api/hotels/:hotel_id/edit-requests) lives in hotels.js, co-located with
// the resource it targets; everything else — listing, approving, rejecting
// — lives here, the same split accessRequests.js uses for access requests.

const express = require('express');
const { pool } = require('../db');
const { requireRole } = require('../middleware/auth');
const { logAuditEvent } = require('../audit');

const router = express.Router();

// GET /api/edit-requests/mine — lets a viewer see the status of what they've
// submitted, most recent first.
router.get('/mine', requireRole(), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM hotel_edit_requests WHERE requested_by_email = $1 ORDER BY requested_at DESC LIMIT 20`,
      [req.user.email]
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/edit-requests — admin/owner review queue.
router.get('/', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const status = req.query.status;
    const conditions = [];
    const params = [];
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT er.*, h.name AS hotel_name
         FROM hotel_edit_requests er
         LEFT JOIN hotels h ON h.hotel_id = er.hotel_id
         ${where}
        ORDER BY er.requested_at DESC`,
      params
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/edit-requests/:id/approve — admin/owner. Applies the stored
// `to` values to the live hotel record. If the hotel was deleted or the
// column set has since changed underneath the request, this fails loudly
// (404 / column error) rather than silently applying a partial update.
router.post('/:id/approve', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const reqResult = await pool.query(
      `SELECT * FROM hotel_edit_requests WHERE id = $1 AND status = 'pending'`,
      [req.params.id]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending edit request not found.' });
    }
    const request = reqResult.rows[0];
    const changes = request.changes;
    const fields = Object.keys(changes);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'This request has no changes recorded.' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => changes[f].to);

    const updateResult = await pool.query(
      `UPDATE hotels SET ${setClause} WHERE hotel_id = $${fields.length + 1} AND deleted_at IS NULL RETURNING hotel_id, name`,
      [...values, request.hotel_id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(409).json({ error: `Hotel ${request.hotel_id} no longer exists — cannot apply this edit.` });
    }

    await pool.query(
      `UPDATE hotel_edit_requests
          SET status = 'approved', reviewed_at = now(), reviewed_by_email = $2
        WHERE id = $1`,
      [request.id, req.user.email]
    );

    await logAuditEvent({
      eventType: 'hotel_edit_approved',
      userEmail: req.user.email,
      hotelId: request.hotel_id,
      detail: `Approved edit from ${request.requested_by_email}: ${fields.join(', ')}`,
    });

    res.json({ data: { ...request, status: 'approved' } });
  } catch (err) {
    next(err);
  }
});

// POST /api/edit-requests/:id/reject — admin/owner. Optional { note } is
// shown back to the submitter so they know why.
router.post('/:id/reject', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const note = (req.body && req.body.note) ? String(req.body.note).slice(0, 500) : null;

    const reqResult = await pool.query(
      `SELECT * FROM hotel_edit_requests WHERE id = $1 AND status = 'pending'`,
      [req.params.id]
    );
    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending edit request not found.' });
    }
    const request = reqResult.rows[0];

    await pool.query(
      `UPDATE hotel_edit_requests
          SET status = 'rejected', reviewed_at = now(), reviewed_by_email = $2, review_note = $3
        WHERE id = $1`,
      [request.id, req.user.email, note]
    );

    await logAuditEvent({
      eventType: 'hotel_edit_rejected',
      userEmail: req.user.email,
      hotelId: request.hotel_id,
      detail: `Rejected edit from ${request.requested_by_email}${note ? `: ${note}` : ''}`,
    });

    res.json({ data: { ...request, status: 'rejected', review_note: note } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
