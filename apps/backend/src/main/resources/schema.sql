ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamp without time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prepared_at timestamp without time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at timestamp without time zone;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points integer NOT NULL DEFAULT 0;
