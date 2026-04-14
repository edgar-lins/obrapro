ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan               TEXT      DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT      DEFAULT '',
  ADD COLUMN IF NOT EXISTS plan_expires_at    TIMESTAMP NULL;
