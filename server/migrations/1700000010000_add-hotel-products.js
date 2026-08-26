/* eslint-disable camelcase */

exports.shorthands = undefined;

// Which safety/medical items a property actually has on site. Stored as a
// jsonb array of stable keys (see PRODUCT_KEYS in routes/hotels.js) rather
// than one boolean column per item, so adding an item to the list is a
// front-end change and not a migration every time.
exports.up = (pgm) => {
  pgm.addColumns('hotels', {
    products: { type: 'jsonb', notNull: true, default: '[]' },
  });
  // Filtering "has an AED" means a containment test, which needs GIN.
  pgm.createIndex('hotels', 'products', { method: 'gin' });
};

exports.down = (pgm) => {
  pgm.dropColumns('hotels', ['products']);
};
