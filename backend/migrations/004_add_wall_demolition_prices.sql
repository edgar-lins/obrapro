-- Revestimento de parede — mão de obra
ALTER TABLE price_tables
  ADD COLUMN IF NOT EXISTS wall_porcelain_price         NUMERIC(10,2) DEFAULT 130.00,
  ADD COLUMN IF NOT EXISTS wall_ceramic_price           NUMERIC(10,2) DEFAULT 90.00,
  ADD COLUMN IF NOT EXISTS wall_other_price             NUMERIC(10,2) DEFAULT 100.00,
-- Demolição
  ADD COLUMN IF NOT EXISTS demolition_manual_price      NUMERIC(10,2) DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS demolition_mechanical_price  NUMERIC(10,2) DEFAULT 40.00;
