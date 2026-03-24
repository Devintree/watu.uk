const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/const body = Object\.fromEntries\(new FormData\(e\.target\)\.entries\(\)\);/g, "const body = Object.fromEntries(new FormData(e.target).entries());\n    body.currency = typeof currency !== 'undefined' ? currency : 'GBP';\n");
  fs.writeFileSync(file, code);
}

['src/routes/guides.ts', 'src/routes/studyTours.ts'].forEach(patch);
