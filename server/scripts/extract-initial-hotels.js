// One-time helper: pulls the `initialHotels` array out of the frontend's
// script.js and writes it to data/hotels.json, so the import script has a
// plain data file to read instead of parsing JS on every run.
//
// Usage: npm run db:extract

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SCRIPT_JS_PATH = path.join(__dirname, '..', '..', 'script.js');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'hotels.json');

function extractArrayLiteral(source) {
  const startMarker = 'const initialHotels = [';
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) {
    throw new Error('Could not find "const initialHotels = [" in script.js');
  }

  // Walk bracket depth from the opening '[' to find its matching ']'.
  const arrayStart = startIdx + startMarker.length - 1;
  let depth = 0;
  let endIdx = -1;
  for (let i = arrayStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx === -1) {
    throw new Error('Could not find the closing bracket for initialHotels.');
  }

  return source.slice(arrayStart, endIdx + 1);
}

function main() {
  if (!fs.existsSync(SCRIPT_JS_PATH)) {
    console.error(`script.js not found at ${SCRIPT_JS_PATH}`);
    process.exit(1);
  }

  const source = fs.readFileSync(SCRIPT_JS_PATH, 'utf8');
  const arrayLiteral = extractArrayLiteral(source);

  // Evaluate the array literal in an isolated VM context (no access to the
  // running process's globals) rather than trusting eval() on raw source.
  const sandbox = {};
  vm.createContext(sandbox);
  const hotels = vm.runInContext(`(${arrayLiteral})`, sandbox, { timeout: 5000 });

  if (!Array.isArray(hotels)) {
    throw new Error('Extracted initialHotels did not evaluate to an array.');
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(hotels, null, 2), 'utf8');

  console.log(`Extracted ${hotels.length} hotel record(s) to ${OUTPUT_PATH}`);
  if (hotels.length < 500) {
    console.warn(
      `Note: script.js currently contains only ${hotels.length} hotel record(s), ` +
      `not the ~2,094 mentioned in the implementation spec. Replace the initialHotels ` +
      `array in script.js with the full dataset and re-run "npm run db:extract" before importing.`
    );
  }
}

main();
