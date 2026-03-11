-- 种子数据：英国华人服务平台示例数据

-- ============================
-- 酒店/住宿数据
-- ============================
INSERT OR IGNORE INTO hotels (title_zh, title_en, description_zh, description_en, city, address, images, amenities_zh, amenities_en, price_per_night, room_type, max_guests, rating, review_count) VALUES
(
  '牛津海丁顿豪华套房', 
  'Oxford Headington Luxury Ensuite',
  '位于牛津海丁顿区的高档套房，独立卫浴，配备超大双人床。房子安静舒适，可使用设备齐全的厨房、漂亮花园和免费停车位。距离牛津大学城区仅15分钟车程。',
  'Premium ensuite room in Oxford Headington with private bathroom and super king bed. Quiet and comfortable, with access to fully equipped kitchen, beautiful garden and free parking. 15 minutes drive to Oxford city centre.',
  'oxford', 'Headington, Oxford OX3 9GS',
  '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]',
  '["独立卫浴","免费WiFi","厨房使用权","花园","免费停车","暖气","洗衣机"]',
  '["Private bathroom","Free WiFi","Kitchen access","Garden","Free parking","Heating","Washing machine"]',
  70, 'ensuite', 2, 4.8, 24
),
(
  '伦敦市中心现代公寓', 
  'London City Centre Modern Apartment',
  '坐落于伦敦市中心的现代化公寓，地铁站步行5分钟，周边餐厅、超市一应俱全。中文服务，专为华人旅客提供贴心接待。',
  'Modern apartment in London city centre, 5 minutes walk to tube station, surrounded by restaurants and supermarkets. Chinese-speaking service available.',
  'london', 'Southwark, London SE1',
  '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
  '["整套公寓","独立厨房","洗衣机","地铁5分钟","WiFi","智能电视"]',
  '["Whole apartment","Private kitchen","Washing machine","5min to tube","WiFi","Smart TV"]',
  120, 'apartment', 4, 4.6, 18
),
(
  '剑桥大学附近温馨单人间', 
  'Cambridge Single Room Near University',
  '位于剑桥大学附近的温馨单人间，安静社区，步行可达各大学院。非常适合短期访学和参观。',
  'Cosy single room near Cambridge University, quiet neighbourhood, walking distance to various colleges. Perfect for short academic visits.',
  'cambridge', 'Cambridge CB2 1TN',
  '["https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800","https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800"]',
  '["单人间","共用卫浴","WiFi","厨房使用权","自行车存放"]',
  '["Single room","Shared bathroom","WiFi","Kitchen access","Bike storage"]',
  45, 'single', 1, 4.5, 12
),
(
  '爱丁堡旧城区精品民宿', 
  'Edinburgh Old Town Boutique B&B',
  '坐落在爱丁堡历史悠久的旧城区，距离爱丁堡城堡步行10分钟。提供苏格兰传统早餐，是体验当地文化的绝佳选择。',
  'Located in Edinburgh historic Old Town, 10 minutes walk to Edinburgh Castle. Scottish traditional breakfast included, perfect for experiencing local culture.',
  'edinburgh', 'Old Town, Edinburgh EH1',
  '["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800","https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"]',
  '["含早餐","免费WiFi","暖气","行李寄存","旅游咨询"]',
  '["Breakfast included","Free WiFi","Heating","Luggage storage","Tourist info"]',
  85, 'double', 2, 4.7, 31
),
(
  '曼彻斯特大学周边双人间', 
  'Manchester Double Room Near University',
  '位于曼彻斯特大学附近的舒适双人间，华人房东，可中文沟通。非常适合留学生和探亲访友。',
  'Comfortable double room near Manchester University, Chinese landlord, Mandarin communication available. Ideal for students and family visits.',
  'manchester', 'Fallowfield, Manchester M14',
  '["https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800","https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800"]',
  '["双人床","共用卫浴","WiFi","厨房","中式烹饪设备","停车位"]',
  '["Double bed","Shared bathroom","WiFi","Kitchen","Chinese cooking equipment","Parking"]',
  55, 'double', 2, 4.4, 9
);

-- ============================
-- 租房数据
-- ============================
INSERT OR IGNORE INTO rentals (title_zh, title_en, description_zh, description_en, city, area, address, images, property_type, bedrooms, bathrooms, price_per_month, deposit_months, available_from, furnishing, bills_included, amenities_zh, amenities_en, transport_zh, transport_en) VALUES
(
  '伦敦Canary Wharf精装一居室',
  'London Canary Wharf 1-Bed Apartment',
  '位于伦敦金融区金丝雀码头的精装一居室公寓，高层景观，现代装修。距离地铁站步行3分钟，非常适合金融从业者或商务人士。我们提供全程中文代办服务，协助签约、开户等。',
  'Premium 1-bed apartment in Canary Wharf financial district, high floor with views, modern furnishing. 3 minutes walk to tube, ideal for finance professionals. Full Chinese agency service available.',
  'london', 'Canary Wharf', 'E14, London',
  '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800","https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]',
  '1bed', 1, 1, 2200, 6, '2026-04-01', 'furnished', 0,
  '["精装修","高层景观","健身房","门卫","地铁3分钟"]',
  '["Premium finish","High floor view","Gym","Concierge","3min to tube"]',
  '地铁Jubilee Line/DLR 3分钟',
  '3 min to Jubilee Line/DLR'
),
(
  '牛津学生专属合租整屋',
  'Oxford Student House Share',
  '牛津大学附近5卧室整屋，专为在读学生设计。独立卧室，共用厨房和客厅，水电网费包含，安全门禁。已有3位优秀学生入住，欢迎您成为新的室友！',
  '5-bedroom house near Oxford University designed for students. Private bedrooms, shared kitchen and living room, all bills included, secure entry. 3 current students, looking for 2 more!',
  'oxford', 'Cowley', 'Oxford OX4',
  '["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800","https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"]',
  'shared', 1, 1, 750, 1, '2026-03-15', 'furnished', 1,
  '["水电网全包","独立卧室","共用厨房","洗衣机","门禁安全"]',
  '["All bills included","Private bedroom","Shared kitchen","Washing machine","Secure entry"]',
  '公交到牛津市中心15分钟，自行车10分钟',
  '15min bus to city centre, 10min by bike'
),
(
  '剑桥市中心精品工作室公寓',
  'Cambridge City Centre Studio Apartment',
  '位于剑桥市中心的精品工作室，精心装修，小巧温馨。步行可达各大学院和主要购物区。非常适合单身人士或短期居住。代理费用低至两周租金。',
  'Boutique studio apartment in Cambridge city centre, tastefully decorated, compact and cosy. Walking distance to colleges and shopping. Ideal for singles. Agency fee as low as 2 weeks rent.',
  'cambridge', 'City Centre', 'Cambridge CB1',
  '["https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800","https://images.unsplash.com/photo-1494203484021-3c454daf695d?w=800"]',
  'studio', 0, 1, 1100, 2, '2026-04-15', 'furnished', 0,
  '["整套工作室","独立厨房","智能门锁","市中心位置"]',
  '["Whole studio","Private kitchen","Smart lock","City centre location"]',
  '步行到剑桥大学国王学院5分钟',
  '5 min walk to Kings College Cambridge'
);

-- ============================
-- 导游数据
-- ============================
INSERT OR IGNORE INTO guides (name_zh, name_en, bio_zh, bio_en, avatar, cities, languages, specialties_zh, specialties_en, price_per_day, price_per_half_day, experience_years, rating, review_count) VALUES
(
  '王明 (William)',
  'William Wang',
  '牛津大学历史系博士，在英国生活15年，精通英国历史文化。专注于提供深度文化体验，特别擅长带领家长和孩子探访牛津、剑桥名校，提供专业的留学咨询服务。',
  'Oxford History PhD, 15 years in UK, expert in British history and culture. Specializes in deep cultural experiences, particularly guiding families to visit Oxford and Cambridge universities with professional study abroad consultation.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  '["oxford","cambridge","london"]',
  '["zh","en"]',
  '["名校探访","历史文化","留学咨询","博物馆讲解","亲子游"]',
  '["University visits","History & Culture","Study abroad consulting","Museum tours","Family tours"]',
  280, 160, 15, 4.9, 87
),
(
  '李晓燕 (Lily)',
  'Lily Li',
  '伦敦本地华人导游，伦敦旅游专业学士，擅长伦敦深度游和美食体验。熟悉伦敦所有热门景点，可定制各类主题路线，如王室文化、当代艺术、下午茶体验等。',
  'Local London Chinese guide, BA in London Tourism. Expert in London in-depth tours and food experiences. Familiar with all major attractions, offering customized themed tours including Royal culture, contemporary art, afternoon tea.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  '["london"]',
  '["zh","en","cantonese"]',
  '["伦敦深度游","美食体验","王室文化","当代艺术","购物指南"]',
  '["London in-depth tours","Food experiences","Royal culture","Contemporary art","Shopping guide"]',
  250, 140, 8, 4.8, 64
),
(
  '陈志豪 (Jason)',
  'Jason Chen',
  '苏格兰华人导游，爱丁堡大学毕业，深爱苏格兰文化与历史。可带领您探索爱丁堡老城、高地景观、威士忌体验等。提供家庭定制和企业团建服务。',
  'Scottish Chinese guide, Edinburgh University graduate, passionate about Scottish culture and history. Can guide Edinburgh Old Town, Highland landscapes, whisky experiences. Family and corporate team building services available.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  '["edinburgh","glasgow","highlands"]',
  '["zh","en"]',
  '["爱丁堡城堡","苏格兰高地","威士忌之旅","城市徒步","摄影游"]',
  '["Edinburgh Castle","Scottish Highlands","Whisky tours","City walking","Photography tours"]',
  260, 150, 6, 4.7, 42
);

-- ============================
-- 导游套餐数据
-- ============================
INSERT OR IGNORE INTO guide_packages (guide_id, title_zh, title_en, description_zh, description_en, duration_hours, includes_zh, includes_en, price, max_people, city) VALUES
(1, '牛津+剑桥双城一日游', 'Oxford & Cambridge One Day Tour',
  '早从牛津出发，参观各大学院、博德利图书馆，下午前往剑桥，乘船游览康河，返程含英式下午茶。',
  'Depart from Oxford in the morning, visit colleges and Bodleian Library, afternoon to Cambridge, punting on the Cam, return includes English afternoon tea.',
  10, '["专车接送","导游服务","康河撑篙","下午茶","入场门票"]', '["Private transfer","Guide service","Punting on Cam","Afternoon tea","Entry tickets"]',
  180, 8, 'oxford'),
(1, '牛津名校深度参访', 'Oxford University In-depth Visit',
  '专业导游带领探访牛津大学各学院，深入了解英国高等教育体系，适合有留学计划的家庭。',
  'Professional guide to visit Oxford colleges in depth, understanding UK higher education system, ideal for families planning to study abroad.',
  5, '["导游服务","学院门票","中文讲解","留学资讯手册"]', '["Guide service","College tickets","Mandarin commentary","Study abroad info pack"]',
  120, 6, 'oxford'),
(2, '伦敦王室文化半日游', 'London Royal Culture Half Day',
  '参观白金汉宫、圣詹姆斯公园、西敏寺，体验正宗英式下午茶，了解英国王室文化与历史。',
  'Visit Buckingham Palace, St James Park, Westminster Abbey, enjoy authentic English afternoon tea, learn about British Royal culture and history.',
  4, '["导游服务","入场门票","下午茶","地铁卡"]', '["Guide service","Entry tickets","Afternoon tea","Oyster card"]',
  110, 10, 'london'),
(2, '伦敦地道美食探索一日游', 'London Authentic Food Tour Full Day',
  '探索伦敦多元美食文化，从Borough Market到唐人街，品尝地道英国早餐、亚洲美食和英式传统菜肴。',
  'Explore London diverse food culture, from Borough Market to Chinatown, taste authentic English breakfast, Asian cuisine and traditional British dishes.',
  8, '["导游服务","美食品尝","市场门票","交通卡"]', '["Guide service","Food tasting","Market entry","Travel card"]',
  150, 8, 'london'),
(3, '爱丁堡城堡与皇家一英里', 'Edinburgh Castle & Royal Mile',
  '游览爱丁堡城堡、皇家一英里、荷里路德宫，品尝苏格兰传统美食，感受苏格兰风情。',
  'Tour Edinburgh Castle, Royal Mile, Holyrood Palace, taste traditional Scottish food, experience Scottish culture.',
  6, '["导游服务","城堡门票","宫殿参观","苏格兰美食品鉴"]', '["Guide service","Castle tickets","Palace visit","Scottish food tasting"]',
  140, 10, 'edinburgh');

-- ============================
-- 游学接待数据
-- ============================
INSERT OR IGNORE INTO study_tours (title_zh, title_en, description_zh, description_en, images, duration_days, cities, highlights_zh, highlights_en, itinerary_zh, itinerary_en, includes_zh, includes_en, excludes_zh, excludes_en, price_per_person, min_age, max_age, min_people, max_people, category, next_available) VALUES
(
  '牛津剑桥精英游学营（7天）',
  'Oxford Cambridge Elite Study Tour (7 Days)',
  '专为12-18岁青少年设计的顶级游学项目，深入探访牛津、剑桥两所世界顶尖学府。参与由名校学者主讲的学术课程，体验百年学院生活，结交来自世界各地的优秀同龄人。',
  'Premium study tour designed for 12-18 year olds, in-depth visits to Oxford and Cambridge, two of the world most prestigious universities. Academic sessions by scholars, experience century-old college life, make friends with peers worldwide.',
  '["https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800","https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800","https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800"]',
  7, '["oxford","cambridge","london"]',
  '["牛津大学学院参访","剑桥康河撑篙","名师学术讲座","英语强化培训","英国文化体验","博物馆参观","英式下午茶"]',
  '["Oxford college visits","Cambridge punting","Academic lectures","English language training","British culture experience","Museum visits","English afternoon tea"]',
  '[{"day":1,"zh":"抵达伦敦，接机安置，欢迎晚宴","en":"Arrive London, airport transfer, welcome dinner"},{"day":2,"zh":"伦敦名胜参观：大英博物馆、白金汉宫、泰晤士河游船","en":"London sightseeing: British Museum, Buckingham Palace, Thames cruise"},{"day":3,"zh":"前往牛津，大学城参观，学院座谈","en":"Travel to Oxford, university city tour, college discussion"},{"day":4,"zh":"牛津学术日：参与模拟课程，图书馆体验","en":"Oxford academic day: mock lectures, library experience"},{"day":5,"zh":"前往剑桥，学院参观，康河撑篙体验","en":"Travel to Cambridge, college visits, punting on River Cam"},{"day":6,"zh":"剑桥文化日：博物馆、市场、传统英式活动","en":"Cambridge culture day: museums, market, traditional English activities"},{"day":7,"zh":"返回伦敦，结业典礼，送机","en":"Return to London, graduation ceremony, airport transfer"}]',
  '[{"day":1,"zh":"抵达伦敦，接机安置，欢迎晚宴","en":"Arrive London, airport transfer, welcome dinner"},{"day":2,"zh":"伦敦名胜参观","en":"London sightseeing"},{"day":3,"zh":"前往牛津","en":"Travel to Oxford"},{"day":4,"zh":"牛津学术日","en":"Oxford academic day"},{"day":5,"zh":"前往剑桥","en":"Travel to Cambridge"},{"day":6,"zh":"剑桥文化日","en":"Cambridge culture day"},{"day":7,"zh":"返回伦敦，结业","en":"Return and graduation"}]',
  '["全程住宿","三餐","专车接送","学术课程","门票","中文随行导师","结业证书","保险"]',
  '["All accommodation","3 meals daily","Private transfers","Academic sessions","Entry tickets","Chinese-speaking tutor","Certificate","Insurance"]',
  '["国际机票","个人消费","签证费用"]',
  '["International flights","Personal expenses","Visa fees"]',
  1280, 12, 18, 5, 20, 'academic', '2026-07-01'
),
(
  '英国文化探索夏令营（5天）',
  'British Culture Explorer Summer Camp (5 Days)',
  '适合10-16岁青少年的轻松文化探索项目，以寓教于乐的方式体验英国文化、历史和传统。由专业中英双语导师带领，活动丰富多彩，安全保障一流。',
  'Fun culture exploration for 10-16 year olds, learning through enjoyment about British culture, history and traditions. Led by professional bilingual tutors with diverse activities and top-tier safety standards.',
  '["https://images.unsplash.com/photo-1509059852496-f3822ae057b5?w=800","https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"]',
  5, '["london","oxford"]',
  '["伦敦标志性景点","英国传统手工艺","英语戏剧课","英式下午茶制作","牛津大学参观"]',
  '["London iconic sights","British traditional crafts","English drama class","Afternoon tea making","Oxford University visit"]',
  '[{"day":1,"zh":"抵达伦敦，安置，破冰活动","en":"Arrive London, settle in, ice-breaking activities"},{"day":2,"zh":"伦敦探索：塔桥、伦敦眼、大英博物馆","en":"London exploration: Tower Bridge, London Eye, British Museum"},{"day":3,"zh":"传统工艺日：英国传统手工艺和英语戏剧课","en":"Craft day: British traditional crafts and English drama class"},{"day":4,"zh":"牛津一日游：大学参访，英式下午茶","en":"Oxford day trip: university visit, English afternoon tea"},{"day":5,"zh":"结营典礼，送机","en":"Closing ceremony, airport transfer"}]',
  '[{"day":1,"en":"Arrive"},{"day":2,"en":"London"},{"day":3,"en":"Crafts"},{"day":4,"en":"Oxford"},{"day":5,"en":"Departure"}]',
  '["住宿","三餐","接送","活动门票","双语导师","保险","纪念礼包"]',
  '["Accommodation","3 meals","Transfers","Activity tickets","Bilingual tutor","Insurance","Souvenir pack"]',
  '["国际机票","个人消费"]',
  '["International flights","Personal expenses"]',
  780, 10, 16, 4, 15, 'cultural', '2026-07-15'
),
(
  '英国高校申请咨询游学（3天）',
  'UK University Application Consultation Tour (3 Days)',
  '专为准备申请英国大学的学生（16-22岁）设计。参观多所顶级大学，与在读中国留学生面对面交流，获得专业申请顾问一对一指导，制定个人升学规划。',
  'Designed for students aged 16-22 preparing to apply to UK universities. Visit multiple top universities, face-to-face exchange with current Chinese students, one-on-one guidance from professional consultants, create personal academic plans.',
  '["https://images.unsplash.com/photo-1562774053-701939374585?w=800","https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800"]',
  3, '["london","oxford","cambridge"]',
  '["名校校园参观","在校生经验分享","申请顾问一对一","大学申请工作坊","英语能力测评","个性化升学规划"]',
  '["Campus visits","Current student sharing","1-on-1 consultant","Application workshop","English assessment","Personalized plan"]',
  '[{"day":1,"zh":"牛津大学校园游览，学院参观，在校生交流会","en":"Oxford campus tour, college visits, current student exchange"},{"day":2,"zh":"剑桥大学参观，申请工作坊，顾问一对一咨询","en":"Cambridge visit, application workshop, 1-on-1 consultant session"},{"day":3,"zh":"伦敦大学参观，总结规划，结业","en":"London university visit, planning summary, graduation"}]',
  '[{"day":1,"en":"Oxford"},{"day":2,"en":"Cambridge"},{"day":3,"en":"London"}]',
  '["住宿两晚","部分餐饮","专车接送","校园参观","顾问咨询","升学规划报告"]',
  '["2 nights accommodation","Partial meals","Private transfers","Campus tours","Consultant session","Academic planning report"]',
  '["国际机票","个人消费","签证"]',
  '["International flights","Personal expenses","Visa"]',
  580, 16, 22, 2, 10, 'academic', '2026-04-01'
);

-- 默认设置
INSERT OR IGNORE INTO settings (key, value) VALUES
('site_name_zh', '英英 - 英国华人服务平台'),
('site_name_en', 'YingYing - UK Chinese Services Platform'),
('contact_email', 'hello@yingying.uk'),
('contact_phone', '+44 7700 900000'),
('contact_wechat', 'YingYingUK'),
('stripe_currency', 'gbp'),
('admin_email', 'admin@yingying.uk');
