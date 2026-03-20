-- ============================================================
-- Agrega columna reference a products + trigger auto-generación
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS reference text UNIQUE;

-- Función que genera la referencia a partir de la categoría
CREATE OR REPLACE FUNCTION generate_product_reference(cat text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  prefix text;
  seq    int;
  ref    text;
BEGIN
  prefix := CASE cat
    WHEN 'ropa'         THEN 'ROP'
    WHEN 'intimo-hogar' THEN 'INT'
    WHEN 'accesorios'   THEN 'ACC'
    WHEN 'especial'     THEN 'ESP'
    ELSE upper(left(cat, 3))
  END;

  SELECT count(*) + 1 INTO seq
  FROM products
  WHERE reference LIKE prefix || '-%';

  ref := prefix || '-' || lpad(seq::text, 3, '0');

  -- Evitar colisiones en caso de concurrencia o huecos
  WHILE EXISTS (SELECT 1 FROM products WHERE reference = ref) LOOP
    seq := seq + 1;
    ref := prefix || '-' || lpad(seq::text, 3, '0');
  END LOOP;

  RETURN ref;
END;
$$;

-- Trigger: asigna referencia automáticamente en INSERT si no viene una
CREATE OR REPLACE FUNCTION set_product_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := generate_product_reference(NEW.category);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_reference ON products;
CREATE TRIGGER products_set_reference
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION set_product_reference();
