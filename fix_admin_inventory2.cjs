const fs = require('fs');
let code = fs.readFileSync('src/routes/admin-api.ts', 'utf8');
code = code.replace(
  `bind(room_type_id, date, price, available_count, is_closed)`,
  `bind(room_type_id, date, price, price_cny, available_count, is_closed)`
);
fs.writeFileSync('src/routes/admin-api.ts', code);
