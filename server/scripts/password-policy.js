// Shared password rules for the provisioning scripts. There is no
// self-registration endpoint, so these scripts are the only place passwords
// enter the system — the policy lives here rather than in the API.

const MIN_LENGTH = 9;

const BANNED = new Set([
  'password', 'password1', 'password123', '123456789', '12345678',
  'changeme', 'letmein', 'admin123', 'qwertyuiop',
  // The demo credentials from local development.
  'ownerpass123', 'adminpass123', 'viewerpass123',
]);

// Returns an array of problems; empty means the password is acceptable.
function checkPassword(password) {
  const problems = [];
  const value = (password || '').toString();

  if (value.length < MIN_LENGTH) {
    problems.push(`must be at least ${MIN_LENGTH} characters (got ${value.length})`);
  }
  if (BANNED.has(value.toLowerCase())) {
    problems.push('is a known/demo password — pick something else');
  }
  if (/^(.)\1+$/.test(value)) {
    problems.push('cannot be a single repeated character');
  }

  return problems;
}

function suggestPassword() {
  // Ambiguous glyphs (0/O, 1/l/I) left out so it survives being read aloud
  // or copied off a screen.
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = require('crypto').randomBytes(24);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

module.exports = { checkPassword, suggestPassword, MIN_LENGTH };
