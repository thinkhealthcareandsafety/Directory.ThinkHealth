/* eslint-disable camelcase */

exports.shorthands = undefined;

// Viewers can't write to `hotels` directly (see requireRole('owner','admin')
// on the write routes) but they're often the people who actually know a
// contact changed. This table lets them propose the change instead of being
// locked out entirely: their diff sits here as `pending` until an admin or
// owner approves it (applied to `hotels`) or rejects it (left as a record,
// nothing touched). One row per submission, not per field, so a reviewer
// sees "here's what they changed" as one unit rather than a scatter of
// single-field edits.
exports.up = (pgm) => {
  pgm.createTable('hotel_edit_requests', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    hotel_id: { type: 'text', notNull: true },
    requested_by_email: { type: 'text', notNull: true },
    // { field_name: { from: <old value>, to: <new value> }, ... } — only the
    // fields actually changed, not a full record copy, so a reviewer's diff
    // view has nothing irrelevant to wade through.
    changes: { type: 'jsonb', notNull: true },
    status: { type: 'text', notNull: true, default: 'pending' },
    requested_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    reviewed_at: { type: 'timestamptz' },
    reviewed_by_email: { type: 'text' },
    review_note: { type: 'text' },
  });

  pgm.addConstraint('hotel_edit_requests', 'hotel_edit_requests_status_check', {
    check: "status IN ('pending', 'approved', 'rejected')",
  });

  // Reviewing "what's pending" and "history for this hotel" are the two
  // access patterns; both benefit from an index.
  pgm.createIndex('hotel_edit_requests', 'status');
  pgm.createIndex('hotel_edit_requests', 'hotel_id');
};

exports.down = (pgm) => {
  pgm.dropTable('hotel_edit_requests');
};
