const fs = require('fs');
let file = fs.readFileSync('src/lib/layout.ts', 'utf8');

file = file.replace(/const res = await fetch\('\/api\/auth\/me'\);/g, "const res = await fetch('/api/auth/me', { cache: 'no-store' });");

fs.writeFileSync('src/lib/layout.ts', file);
console.log("Patched layout.ts");
