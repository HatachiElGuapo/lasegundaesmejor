-- Migración: actualizar sistema de categorías
-- Fecha: 2026-03-18
--
-- Categorías principales (category):
--   ropa | intimo-hogar | accesorios | especial
--
-- Subcategorías (subcategory, nueva columna):
--   ROPA:          vestidos | tops | pantalones-faldas | abrigos | conjuntos-especiales
--   ÍNTIMO/HOGAR:  lenceria | pijamas | ropa-de-bano | fajas
--   ACCESORIOS:    bolsos-billeteras | zapatos | bufandas-correas | articulos-varios
--   ESPECIAL:      ninos | regaladas | ropa-de-verano

-- 1. Agregar columna subcategory
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 2. Actualizar el tipo (constraint) de category al nuevo vocabulario
--    Primero eliminamos el constraint antiguo si existe
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_check;

-- 3. Migrar valores existentes de category al nuevo esquema
UPDATE products SET category = 'ropa'        WHERE category IN ('tops', 'outerwear');
UPDATE products SET category = 'accesorios'  WHERE category = 'accesorios';
UPDATE products SET category = 'ropa'        WHERE category = 'bottoms';

-- 4. Agregar constraint nuevo para category
ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('ropa', 'intimo-hogar', 'accesorios', 'especial'));

-- 5. Agregar constraint para subcategory
ALTER TABLE products
  ADD CONSTRAINT products_subcategory_check
  CHECK (subcategory IN (
    'vestidos', 'tops', 'pantalones-faldas', 'abrigos', 'conjuntos-especiales',
    'lenceria', 'pijamas', 'ropa-de-bano', 'fajas',
    'bolsos-billeteras', 'zapatos', 'bufandas-correas', 'articulos-varios',
    'ninos', 'regaladas', 'ropa-de-verano'
  ));

-- Nota: los productos existentes necesitan tener subcategory asignada
-- manualmente antes de que el constraint sea NOT NULL.
-- Cuando todos los productos tengan subcategory asignada, ejecutar:
--   ALTER TABLE products ALTER COLUMN subcategory SET NOT NULL;
