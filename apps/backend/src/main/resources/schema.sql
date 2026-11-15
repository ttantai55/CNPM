ALTER TABLE orders ADD COLUMN IF NOT EXISTS prepared_at timestamp without time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at timestamp without time zone;
