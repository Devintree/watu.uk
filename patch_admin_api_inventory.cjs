const fs = require('fs');
let code = fs.readFileSync('src/routes/admin-api.ts', 'utf8');

code = code.replace(
  `const { room_type_id, start_date, end_date, price, available_count, is_closed } = await c.req.json()`,
  `const { room_type_id, start_date, end_date, price, price_cny, available_count, is_closed } = await c.req.json()`
);

code = code.replace(
  `VALUES (?, ?, ?, ?, ?)`,
  `VALUES (?, ?, ?, ?, ?, ?)`
);

code = code.replace(
  `DO UPDATE SET price=excluded.price, available_count=excluded.available_count, is_closed=excluded.is_closed`,
  `DO UPDATE SET price=excluded.price, price_cny=excluded.price_cny, available_count=excluded.available_count, is_closed=excluded.is_closed`
);

// We need to inject the `price_cny` binding logic into the promise array creation
// Let's do it with a regex carefully
code = code.replace(
  `INSERT INTO room_inventory (room_type_id, date, price, available_count, is_closed)`,
  `INSERT INTO room_inventory (room_type_id, date, price, price_cny, available_count, is_closed)`
);

code = code.replace(
  `bind(room_type_id, d, price, available_count, is_closed)`,
  `bind(room_type_id, d, price, price_cny, available_count, is_closed)`
);

fs.writeFileSync('src/routes/admin-api.ts', code);
console.log('Admin API inventory patched');
