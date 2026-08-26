/* eslint-disable camelcase */

exports.shorthands = undefined;

// Durable queue for Postgres -> Zoho sync (one-way, per spec section 3).
// Every hotel create/update/soft-delete enqueues a row here instead of
// calling Zoho inline, so the worker can rate-limit to <=100/min and so
// nothing is lost if the process restarts mid-batch.
exports.up = (pgm) => {
  pgm.createTable('zoho_sync_queue', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    hotel_id: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'pending' }, // pending | sent | failed
    attempts: { type: 'integer', notNull: true, default: 0 },
    last_error: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    processed_at: { type: 'timestamptz' },
  });

  pgm.addConstraint('zoho_sync_queue', 'zoho_sync_queue_status_check', {
    check: "status IN ('pending', 'sent', 'failed')",
  });

  pgm.createIndex('zoho_sync_queue', ['status', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('zoho_sync_queue');
};
