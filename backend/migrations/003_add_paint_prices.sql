-- Adiciona colunas de preço de pintura à tabela de preços
ALTER TABLE price_tables
  ADD COLUMN IF NOT EXISTS acrylic_paint_price  NUMERIC(10,2) DEFAULT 12.00,
  ADD COLUMN IF NOT EXISTS latex_paint_price    NUMERIC(10,2) DEFAULT 10.00,
  ADD COLUMN IF NOT EXISTS enamel_paint_price   NUMERIC(10,2) DEFAULT 18.00,
  ADD COLUMN IF NOT EXISTS paint_material_price NUMERIC(10,2) DEFAULT 25.00,
  ADD COLUMN IF NOT EXISTS massa_corrida_price  NUMERIC(10,2) DEFAULT 8.00,
  ADD COLUMN IF NOT EXISTS fundo_price          NUMERIC(10,2) DEFAULT 20.00;
