/* eslint-disable camelcase */

// Accounts only ever stored an email, so the UI could only ever derive an
// avatar initial from the address itself ("sjasmeet7499@..." -> "S"), which is
// not necessarily the person's initial. A nullable display name lets the app
// show the right thing without forcing anyone to fill it in.

exports.up = (pgm) => {
  pgm.addColumn('users', {
    full_name: { type: 'text', notNull: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'full_name');
};
