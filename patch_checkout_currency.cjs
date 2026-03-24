const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('body.amount =')) {
    code = code.replace(/body\.amount = ([^\n]+)\n/, "body.amount = $1\n    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';\n");
    fs.writeFileSync(file, code);
  } else if (file.includes('rentals.ts') && code.includes("const body = Object.fromEntries(data.entries());")) {
    code = code.replace(/const body = Object\.fromEntries\(data\.entries\(\)\);/, "const body = Object.fromEntries(data.entries());\n    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';\n");
    fs.writeFileSync(file, code);
  }
}

['src/routes/hotels.ts', 'src/routes/rentals.ts', 'src/routes/guides.ts', 'src/routes/studyTours.ts'].forEach(patch);

// specifically patch rentals, guides, tours because they have slight variations
