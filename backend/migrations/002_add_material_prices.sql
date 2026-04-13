-- Adiciona colunas de preço de material à tabela de preços
ALTER TABLE price_tables
  ADD COLUMN IF NOT EXISTS porcelain_material_price NUMERIC(10,2) DEFAULT 80.00,
  ADD COLUMN IF NOT EXISTS ceramic_material_price   NUMERIC(10,2) DEFAULT 45.00,
  ADD COLUMN IF NOT EXISTS vinyl_material_price     NUMERIC(10,2) DEFAULT 55.00,
  ADD COLUMN IF NOT EXISTS other_material_price     NUMERIC(10,2) DEFAULT 60.00;
