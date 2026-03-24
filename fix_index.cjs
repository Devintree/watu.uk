const fs = require('fs');
let code = fs.readFileSync('src/index.tsx', 'utf8');

// Replace `, '/contact'))` with `, '/contact', currency))`
code = code.replace("`, '/contact'))", "`, '/contact', currency))");
fs.writeFileSync('src/index.tsx', code);
