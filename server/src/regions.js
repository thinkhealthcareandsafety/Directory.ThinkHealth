// Classification of the free-text `state` column.
//
// The column mixes three different things: Indian states, Indian union
// territories, and foreign first-level regions ("Bagmati Province",
// "Greater London (UK)"). Counting them together produced a meaningless
// "41 States" figure, so they are separated here and counted separately.
//
// Matching is done on a normalised key so "Andaman & Nicobar" and
// "Andaman and Nicobar Islands" resolve to the same entry.

function normalise(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z]+/g, '');
}

// The 28 states of India.
const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

// The 8 union territories, including the spellings this dataset actually uses.
const UNION_TERRITORIES = [
  'Andaman and Nicobar Islands', 'Andaman and Nicobar',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'New Delhi', 'NCT of Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry', 'Pondicherry',
];

const STATE_KEYS = new Set(STATES.map(normalise));
const UT_KEYS = new Set(UNION_TERRITORIES.map(normalise));

function classifyRegion(value) {
  const key = normalise(value);
  if (STATE_KEYS.has(key)) return 'state';
  if (UT_KEYS.has(key)) return 'union_territory';
  return 'foreign';
}

module.exports = { classifyRegion, normalise, STATES, UNION_TERRITORIES };
