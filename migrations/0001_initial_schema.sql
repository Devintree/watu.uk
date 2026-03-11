-- 英国华人服务平台数据库 Schema
-- 迁移版本: 0001

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  wechat TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'user', -- user, admin
  lang TEXT DEFAULT 'zh', -- zh, en
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 酒店/住宿模块
-- ============================
CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  city TEXT NOT NULL, -- london, oxford, cambridge, manchester, edinburgh
  address TEXT NOT NULL,
  images TEXT, -- JSON array of image URLs
  amenities_zh TEXT, -- JSON array
  amenities_en TEXT, -- JSON array
  price_per_night REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  room_type TEXT, -- single, double, ensuite, apartment
  max_guests INTEGER DEFAULT 2,
  is_available INTEGER DEFAULT 1,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 租房代办模块
-- ============================
CREATE TABLE IF NOT EXISTS rentals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  city TEXT NOT NULL,
  area TEXT, -- 区域
  address TEXT,
  images TEXT, -- JSON array
  property_type TEXT, -- studio, 1bed, 2bed, 3bed, shared
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  price_per_month REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  deposit_months INTEGER DEFAULT 1,
  available_from DATE,
  furnishing TEXT, -- furnished, unfurnished, part-furnished
  bills_included INTEGER DEFAULT 0, -- 0/1
  amenities_zh TEXT,
  amenities_en TEXT,
  transport_zh TEXT, -- 交通信息
  transport_en TEXT,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 导游服务模块
-- ============================
CREATE TABLE IF NOT EXISTS guides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  bio_zh TEXT,
  bio_en TEXT,
  avatar TEXT,
  cities TEXT, -- JSON array of cities covered
  languages TEXT DEFAULT '["zh","en"]', -- JSON array
  specialties_zh TEXT, -- JSON array: 历史, 文化, 美食...
  specialties_en TEXT,
  price_per_day REAL NOT NULL,
  price_per_half_day REAL,
  currency TEXT DEFAULT 'GBP',
  experience_years INTEGER DEFAULT 1,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 导游套餐
CREATE TABLE IF NOT EXISTS guide_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guide_id INTEGER,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  duration_hours INTEGER,
  includes_zh TEXT, -- JSON
  includes_en TEXT,
  price REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  max_people INTEGER DEFAULT 10,
  city TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES guides(id)
);

-- ============================
-- 游学接待模块
-- ============================
CREATE TABLE IF NOT EXISTS study_tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  images TEXT, -- JSON array
  duration_days INTEGER,
  cities TEXT, -- JSON array
  highlights_zh TEXT, -- JSON array
  highlights_en TEXT,
  itinerary_zh TEXT, -- JSON (day by day)
  itinerary_en TEXT,
  includes_zh TEXT, -- JSON
  includes_en TEXT,
  excludes_zh TEXT,
  excludes_en TEXT,
  price_per_person REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  min_age INTEGER DEFAULT 12,
  max_age INTEGER DEFAULT 25,
  min_people INTEGER DEFAULT 1,
  max_people INTEGER DEFAULT 20,
  difficulty TEXT DEFAULT 'easy',
  category TEXT, -- academic, cultural, language, mixed
  next_available DATE,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 订单系统（通用）
-- ============================
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  user_wechat TEXT,
  service_type TEXT NOT NULL, -- hotel, rental, guide, study_tour
  service_id INTEGER NOT NULL,
  service_title TEXT NOT NULL,
  
  -- 日期相关
  check_in DATE,
  check_out DATE,
  service_date DATE,
  
  -- 人数
  guests INTEGER DEFAULT 1,
  
  -- 金额
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'GBP',
  
  -- 特殊要求
  special_requests TEXT,
  
  -- 状态
  status TEXT DEFAULT 'pending', -- pending, confirmed, paid, cancelled, completed, refunded
  
  -- Stripe 支付
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  payment_status TEXT DEFAULT 'unpaid', -- unpaid, paid, refunded
  paid_at DATETIME,
  
  -- 管理员备注
  admin_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 咨询/询盘表单（租房）
-- ============================
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wechat TEXT,
  service_type TEXT, -- rental, hotel, guide, study_tour, general
  service_id INTEGER,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, replied, closed
  admin_reply TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================
-- 评价系统
-- ============================
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  service_type TEXT NOT NULL,
  service_id INTEGER NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment_zh TEXT,
  comment_en TEXT,
  is_approved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ============================
-- 网站设置
-- ============================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_service ON orders(service_type, service_id);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city);
CREATE INDEX IF NOT EXISTS idx_rentals_city ON rentals(city);
CREATE INDEX IF NOT EXISTS idx_guides_city ON guides(cities);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_type, service_id);
