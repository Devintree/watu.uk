const fs = require('fs');

function fixBinds(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix multiple COALESCEs
  code = code.replace(/COALESCE\([\s\S]*?as dynamic_price_cny,\s*COALESCE\([\s\S]*?as dynamic_price_cny/g, `COALESCE(
          (SELECT MIN(ri.price_cny) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price_cny) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night_cny
        ) as dynamic_price_cny`);
        
  // Also we need to ensure the bindings have the correct number of `today` parameters.
  // We have 2 `?`s for the prices.
  // In hotels.ts:
  // `.bind(today, city)` -> `.bind(today, today, city)`
  // `.bind(today)` -> `.bind(today, today)`
  // In home.ts:
  // `.bind(today)` -> `.bind(today, today)`
  // wait, what about the second query in hotels.ts (`hotel = await c.env.DB.prepare...`)
  // `.bind(today, id)` -> `.bind(today, today, id)`
  
  code = code.replace(/\.bind\(today, city\)/g, '.bind(today, today, city)');
  code = code.replace(/\.bind\(today\)/g, '.bind(today, today)');
  code = code.replace(/\.bind\(today, id\)/g, '.bind(today, today, id)');
  
  // Wait, I should make sure I don't replace it twice if I run it again.
  // Let's just do a clean replace if it's currently wrong.
  
  fs.writeFileSync(file, code);
}

fixBinds('src/routes/hotels.ts');
fixBinds('src/routes/home.ts');

console.log("SQL bindings fixed");
