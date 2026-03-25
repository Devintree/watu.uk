const fs = require('fs');
const files = ['src/routes/hotels.ts', 'src/routes/rentals.ts', 'src/routes/guides.ts', 'src/routes/studyTours.ts', 'src/routes/home.ts', 'src/routes/payment.ts'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  // Remove `const currency = getCurrency(c);` inside template strings.
  // It's usually after `const lang = '${lang}';`
  code = code.replace(/const lang = '\$\{lang\}';\n\s*const currency = getCurrency\(c\);/g, "const lang = '${lang}';");
  
  // also check if any other bad injections exist
  fs.writeFileSync(file, code);
});
console.log("Fixed script injections");
