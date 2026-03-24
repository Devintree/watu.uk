const fs = require('fs');
let code = fs.readFileSync('src/routes/admin-api.ts', 'utf8');
code = code.replace(
  `DO UPDATE SET \\n          price = excluded.price, \\n          available_count = excluded.available_count, \\n          is_closed = excluded.is_closed`,
  `DO UPDATE SET \\n          price = excluded.price, \\n          price_cny = excluded.price_cny, \\n          available_count = excluded.available_count, \\n          is_closed = excluded.is_closed`
);
// I should just replace it dynamically using a better regex
code = code.replace(/price = excluded\.price,\s*available_count = excluded\.available_count/g, "price = excluded.price, \n          price_cny = excluded.price_cny, \n          available_count = excluded.available_count");
fs.writeFileSync('src/routes/admin-api.ts', code);
