ALTER TABLE hotels ADD COLUMN price_per_night_cny REAL DEFAULT 0;
ALTER TABLE room_types ADD COLUMN base_price_cny REAL DEFAULT 0;
ALTER TABLE room_inventory ADD COLUMN price_cny REAL DEFAULT 0;
ALTER TABLE rentals ADD COLUMN price_per_month_cny REAL DEFAULT 0;
ALTER TABLE guides ADD COLUMN price_per_day_cny REAL DEFAULT 0;
ALTER TABLE study_tours ADD COLUMN price_per_person_cny REAL DEFAULT 0;
