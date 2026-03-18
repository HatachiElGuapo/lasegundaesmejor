-- Agrega campo de dirección de envío a la tabla orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;
