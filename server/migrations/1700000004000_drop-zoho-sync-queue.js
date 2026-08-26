/* eslint-disable camelcase */

exports.shorthands = undefined;

// Zoho sync was built (Phase 3) but never connected to real Zoho
// credentials, and the project has decided not to pursue Zoho integration.
// This removes the queue table; src/zoho/* and its tests were deleted
// from the codebase in the same change.
exports.up = (pgm) => {
  pgm.dropTable('zoho_sync_queue', { ifExists: true });
};

exports.down = (pgm) => {
  pgm.createTable('zoho_sync_queue', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    hotel_id: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'pending' },
    attempts: { type: 'integer', notNull: true, default: 0 },
    last_error: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    processed_at: { type: 'timestamptz' },
  });
};
