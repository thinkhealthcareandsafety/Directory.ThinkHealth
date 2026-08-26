const STAR_RATINGS = ['3', '4', '5', 'Not Classified'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/\S+$/i;
const CURRENT_YEAR = new Date().getFullYear();

function normalizeHotelId(rawId) {
  return (rawId || '').toString().trim().toUpperCase();
}

function isBlank(val) {
  return val === undefined || val === null || val.toString().trim() === '';
}

// Returns { errors: string[] } — empty array means valid.
function validateHotelInput(body, { partial = false } = {}) {
  const errors = [];
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  const require = (key, label) => {
    if (!partial || has(key)) {
      if (isBlank(body[key])) errors.push(`${label} is required.`);
    }
  };

  require('hotel_id', 'hotel_id');
  require('name', 'name');
  require('city', 'city');

  const EMAIL_FIELDS = ['security_head_email', 'general_manager_email', 'purchase_manager_email', 'other_contact_email'];
  for (const field of EMAIL_FIELDS) {
    if (has(field) && !isBlank(body[field]) && !EMAIL_RE.test(body[field])) {
      errors.push(`${field} is not a valid email address.`);
    }
  }

  const URL_FIELDS = ['linkedin_url', 'security_head_linkedin', 'general_manager_linkedin', 'purchase_manager_linkedin'];
  for (const field of URL_FIELDS) {
    if (has(field) && !isBlank(body[field]) && !URL_RE.test(body[field])) {
      errors.push(`${field} must be a valid http(s) URL.`);
    }
  }

  if (has('establishment_year') && !isBlank(body.establishment_year)) {
    const year = Number(body.establishment_year);
    if (!Number.isInteger(year) || year < 1600 || year > CURRENT_YEAR + 1) {
      errors.push(`establishment_year must be an integer between 1600 and ${CURRENT_YEAR + 1}.`);
    }
  }

  if (has('star_rating') && !isBlank(body.star_rating) && !STAR_RATINGS.includes(body.star_rating.toString())) {
    errors.push(`star_rating must be one of: ${STAR_RATINGS.join(', ')}.`);
  }

  return errors;
}

module.exports = { normalizeHotelId, validateHotelInput, STAR_RATINGS };
