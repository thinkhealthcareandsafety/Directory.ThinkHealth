/* eslint-disable camelcase */

exports.shorthands = undefined;

// The real dataset (2,274 hotels, imported via scripts/import-from-csv.js)
// has a LinkedIn Profile column for every contact role, not just "Other
// Contact" — General Manager, Security Head, and Purchase Manager each
// get their own.
exports.up = (pgm) => {
  pgm.addColumns('hotels', {
    security_head_linkedin: { type: 'text' },
    general_manager_linkedin: { type: 'text' },
    purchase_manager_linkedin: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('hotels', ['security_head_linkedin', 'general_manager_linkedin', 'purchase_manager_linkedin']);
};
