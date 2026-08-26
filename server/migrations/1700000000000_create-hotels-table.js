/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', { ifNotExists: true });

  pgm.createTable('hotels', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    hotel_id: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    brand: { type: 'text' },
    group_name: { type: 'text' },
    establishment_year: { type: 'smallint' },
    star_rating: { type: 'smallint' },
    hospitality_group: { type: 'text' },
    city: { type: 'text', notNull: true },
    state: { type: 'text' },
    country: { type: 'text' },
    category: { type: 'text' },
    security_head_name: { type: 'text' },
    security_head_email: { type: 'text' },
    security_head_phone: { type: 'text' },
    general_manager_name: { type: 'text' },
    general_manager_email: { type: 'text' },
    general_manager_phone: { type: 'text' },
    purchase_manager_name: { type: 'text' },
    purchase_manager_email: { type: 'text' },
    purchase_manager_phone: { type: 'text' },
    other_contact_name: { type: 'text' },
    other_contact_email: { type: 'text' },
    other_contact_phone: { type: 'text' },
    linkedin_url: { type: 'text' },
    last_cpr_training: { type: 'date' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    deleted_at: { type: 'timestamptz' },
  });

  // Final line of defense against duplicate hotel_id — app-level checks in the
  // API are the first line, this constraint is what actually guarantees it.
  pgm.addConstraint('hotels', 'hotels_hotel_id_unique', {
    unique: 'hotel_id',
  });

  pgm.createIndex('hotels', 'deleted_at', {
    name: 'deleted_at_idx',
    where: 'deleted_at IS NULL',
  });

  pgm.createIndex('hotels', 'city');
  pgm.createIndex('hotels', 'brand');
  pgm.createIndex('hotels', 'star_rating');

  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.sql(`
    CREATE TRIGGER hotels_set_updated_at
    BEFORE UPDATE ON hotels
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS hotels_set_updated_at ON hotels;');
  pgm.sql('DROP FUNCTION IF EXISTS set_updated_at();');
  pgm.dropTable('hotels');
};
