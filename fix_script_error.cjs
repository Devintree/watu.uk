const fs = require('fs');

const files = ['src/routes/hotels.ts', 'src/routes/rentals.ts', 'src/routes/guides.ts', 'src/routes/studyTours.ts'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  // First, completely remove ALL `const currency = '${currency}';` inside template scripts.
  // We can safely replace it with empty string, but we also want to remove redundant declarations 
  // if they exist multiple times in the same script block.
  // Wait, if it's declared with `const` in multiple `<script>` tags, that is completely fine as long as they don't share scope.
  // BUT if there are multiple `<script>` tags without `type="module"`, they share the global scope!
  // So `const currency = ...` will throw `SyntaxError: Identifier 'currency' has already been declared`.
  // We should change `const currency` to `var currency` in all frontend scripts to be safe from redeclaration, or just remove it if it's already declared.
  // Easiest is `var currency = '${currency}';` instead of `const`.
  code = code.replace(/const currency = '\$\{currency\}';/g, "var currency = '${currency}';");
  code = code.replace(/const pricePerNight = /g, "var pricePerNight = ");
  code = code.replace(/const lang = /g, "var lang = ");
  code = code.replace(/const pricePerPerson = /g, "var pricePerPerson = ");
  code = code.replace(/const amount = /g, "var amount = ");
  
  fs.writeFileSync(file, code);
});
console.log("Fixed variable redeclarations in global scope.");
