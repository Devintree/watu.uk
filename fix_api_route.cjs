const fs = require('fs');
let code = fs.readFileSync('src/routes/api.ts', 'utf8');
code = code.replace(/apiRoute\.post\('\/webhooks\/stripe', async \(c\) => \{[\s\S]*?(?=apiRoute\.get\('\/orders\/:orderNo')/m, '');
fs.writeFileSync('src/routes/api.ts', code);
