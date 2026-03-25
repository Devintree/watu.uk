const fs = require('fs');

const sql = `      SELECT 
        h.*,
        COALESCE(
          (SELECT MIN(ri.price) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night
        ) as dynamic_price,
        COALESCE(
          (SELECT MIN(ri.price_cny) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price_cny) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night_cny
        ) as dynamic_price_cny
      FROM hotels h 
      WHERE h.is_available = 1`;

let code = fs.readFileSync('src/routes/hotels.ts', 'utf8');
code = code.replace(/SELECT\s+h\.\*,\s+COALESCE\([\s\S]*?FROM hotels h\s+WHERE h\.is_available = 1/, sql);

fs.writeFileSync('src/routes/hotels.ts', code);

let codeHome = fs.readFileSync('src/routes/home.ts', 'utf8');
const sqlHome = `      SELECT 
        h.*,
        COALESCE(
          (SELECT MIN(ri.price) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night
        ) as dynamic_price,
        COALESCE(
          (SELECT MIN(ri.price_cny) FROM room_inventory ri JOIN room_types rt ON ri.room_type_id = rt.id WHERE rt.hotel_id = h.id AND ri.date = ? AND ri.is_closed = 0 AND ri.available_count > 0),
          (SELECT MIN(base_price_cny) FROM room_types WHERE hotel_id = h.id AND is_active = 1),
          h.price_per_night_cny
        ) as dynamic_price_cny
      FROM hotels h 
      WHERE h.is_available = 1 AND h.is_featured = 1
      ORDER BY h.sort_order DESC, h.rating DESC
      LIMIT 4`;
codeHome = codeHome.replace(/SELECT\s+h\.\*,\s+COALESCE\([\s\S]*?LIMIT 4/, sqlHome);
fs.writeFileSync('src/routes/home.ts', codeHome);
console.log("SQL properly fixed");
