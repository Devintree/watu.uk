const fs = require('fs');
const glob = require('glob');

const files = ['src/routes/hotels.ts', 'src/routes/home.ts'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  const priceSql = `COALESCE(
          (SELECT MIN(ri.price) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night
        ) as dynamic_price`;
        
  const priceSqlCny = `COALESCE(
          (SELECT MIN(ri.price) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night
        ) as dynamic_price,
        COALESCE(
          (SELECT MIN(ri.price_cny) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price_cny) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night_cny
        ) as dynamic_price_cny`;
        
  code = code.replace(priceSql, priceSqlCny);
  // It appears twice in hotels.ts, so global replace:
  code = code.split(priceSql).join(priceSqlCny);
  
  fs.writeFileSync(file, code);
});
console.log("Patched SQL for CNY");
