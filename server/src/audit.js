const { pool } = require('./db');

// Never pass password/token values as `detail` — this table is an audit
// trail, not a debug log, and it's not treated as a secret store.
async function logAuditEvent({ eventType, userEmail = null, hotelId = null, detail = null }) {
  try {
    await pool.query(
      'INSERT INTO audit_log (event_type, user_email, hotel_id, detail) VALUES ($1, $2, $3, $4)',
      [eventType, userEmail, hotelId, detail]
    );
  } catch (err) {
    // Audit logging must never break the request it's observing.
    console.error('Failed to write audit log entry:', err);
  }
}

module.exports = { logAuditEvent };
