const fs = require('fs');
let code = fs.readFileSync('src/routes/admin.ts', 'utf8');

// replace rentals schema
code = code.replace("{ key: 'price_per_month', label: '价格/月 (£)', type: 'number' },", "{ key: 'price_per_month', label: '价格/月 (£)', type: 'number' },\n    { key: 'price_per_month_cny', label: '价格/月 (¥)', type: 'number' },");

// replace guides schema
code = code.replace("{ key: 'price_per_day', label: '日均价 (£)', type: 'number' },", "{ key: 'price_per_day', label: '日均价 (£)', type: 'number' },\n    { key: 'price_per_day_cny', label: '日均价 (¥)', type: 'number' },");

// replace study tours schema
code = code.replace("{ key: 'price_per_person', label: '价格/人 (£)', type: 'number' },", "{ key: 'price_per_person', label: '价格/人 (£)', type: 'number' },\n    { key: 'price_per_person_cny', label: '价格/人 (¥)', type: 'number' },");

fs.writeFileSync('src/routes/admin.ts', code);
console.log('Admin schemas patched');
