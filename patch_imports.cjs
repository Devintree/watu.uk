const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/routes/**/*.{ts,tsx}');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('getCurrency') && !code.includes('import') || (code.includes('getCurrency') && !code.match(/import.*getCurrency/))) {
    // Add getCurrency to i18n import
    code = code.replace(/import \{([^}]+)\}\s+from\s+['"]\.\.\/lib\/i18n['"]/g, "import { $1, getCurrency } from '../lib/i18n'");
    fs.writeFileSync(file, code);
  }
});
console.log("Patched imports");
