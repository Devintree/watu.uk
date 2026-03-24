const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.{ts,tsx}');

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Add import if needed
  if (code.includes("getLayout") && !code.includes("getCurrency")) {
    code = code.replace("import { getLang", "import { getLang, getCurrency");
    code = code.replace(/import\s+{\s*t\s*}/, "import { t, getCurrency }");
    code = code.replace(/import\s+{\s*t,\s*Lang\s*}/, "import { t, Lang, getCurrency }");
    modified = true;
  }

  // Find all getLayout(...) calls and pass currency
  // First, ensure currency is defined
  if (code.includes("getLayout") && !code.includes("const currency =")) {
    // insert after lang definition
    code = code.replace(/(const lang = [^\n]+)/g, "$1\n  const currency = getCurrency(c);");
    modified = true;
  }

  // Now replace getLayout calls
  if (code.includes("getLayout")) {
    code = code.replace(/getLayout\((lang[^,]*),\s*([^,]+),\s*([^,]+),\s*([^\)]+)\)/g, "getLayout($1, $2, $3, $4, currency)");
    // Some might omit currentPath, let's handle them if any exist, but in grep output all had 4 args except index.tsx maybe?
    // Let's check the index.tsx
    code = code.replace(/getLayout\((lang[^,]*),\s*([^,]+),\s*([^,]+)\)/g, "getLayout($1, $2, $3, undefined, currency)");
    modified = true;
  }

  // Check how prices are rendered and replace them.
  // Actually, price rendering in templates. E.g. £${price} should become ${currency === 'GBP' ? '£' : '¥'}${currency === 'GBP' ? price : price_cny}.
  // We'll do this in another step.
  
  if (modified) {
    fs.writeFileSync(file, code);
  }
});
console.log("Patched getLayout calls");
