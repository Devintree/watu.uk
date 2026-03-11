CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_zh TEXT,
  content_en TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  cover_image TEXT,
  summary_zh TEXT,
  summary_en TEXT,
  content_zh TEXT,
  content_en TEXT,
  author TEXT,
  view_count INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO pages (slug, title_zh, title_en, content_zh, content_en) VALUES 
('about', '关于我们', 'About Us', '<div class="prose max-w-none"><p>这里是关于我们的内容，请在后台编辑。</p></div>', '<div class="prose max-w-none"><p>This is the About Us content. Please edit in admin.</p></div>'),
('faq', '常见问题', 'FAQ', '<div class="prose max-w-none"><p>这里是常见问题的内容，请在后台编辑。</p></div>', '<div class="prose max-w-none"><p>This is the FAQ content. Please edit in admin.</p></div>'),
('terms', '服务条款', 'Terms of Service', '<div class="prose max-w-none"><p>这里是服务条款的内容，请在后台编辑。</p></div>', '<div class="prose max-w-none"><p>This is the Terms of Service content. Please edit in admin.</p></div>'),
('privacy', '隐私条款', 'Privacy Policy', '<div class="prose max-w-none"><p>这里是隐私条款的内容，请在后台编辑。</p></div>', '<div class="prose max-w-none"><p>This is the Privacy Policy content. Please edit in admin.</p></div>'),
('contact', '联系我们', 'Contact Us', '<div class="prose max-w-none"><p>这里是联系我们的内容，请在后台编辑。</p></div>', '<div class="prose max-w-none"><p>This is the Contact Us content. Please edit in admin.</p></div>');
