-- 1. 扩展原有的 hotels 表
ALTER TABLE hotels ADD COLUMN star_rating INTEGER DEFAULT 0;
ALTER TABLE hotels ADD COLUMN latitude REAL;
ALTER TABLE hotels ADD COLUMN longitude REAL;
ALTER TABLE hotels ADD COLUMN opening_year INTEGER;
ALTER TABLE hotels ADD COLUMN room_count INTEGER;
ALTER TABLE hotels ADD COLUMN phone TEXT;
ALTER TABLE hotels ADD COLUMN email TEXT;
ALTER TABLE hotels ADD COLUMN policies_zh TEXT;
ALTER TABLE hotels ADD COLUMN policies_en TEXT;
ALTER TABLE hotels ADD COLUMN cover_image TEXT;

-- 2. 新增房型表
CREATE TABLE IF NOT EXISTS room_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  images TEXT,
  bed_type TEXT,
  room_size_sqm REAL,
  max_guests INTEGER DEFAULT 2,
  amenities_zh TEXT,
  amenities_en TEXT,
  base_price REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- 3. 新增房态和房价日历表 (精确到天)
CREATE TABLE IF NOT EXISTS room_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_type_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  price REAL NOT NULL,
  available_count INTEGER DEFAULT 1,
  is_closed INTEGER DEFAULT 0, -- 0 = open, 1 = manual close/sold out
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_type_id, date),
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);
