-- ============================================================
-- Auth Setup: profiles, user_id en products/orders, RLS
-- ============================================================

-- 1. user_id en products (propietario de la prenda)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. user_id en orders (usuario que compró)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Tabla profiles con rol
CREATE TABLE IF NOT EXISTS profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Trigger: crear profile automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper: verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- RLS: profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- RLS: products
-- ============================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer productos en stock
DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (
    in_stock = true
    OR auth.uid() = user_id
    OR public.is_admin()
  );

-- Usuarios autenticados pueden crear sus propios productos
DROP POLICY IF EXISTS "products_insert_auth" ON products;
CREATE POLICY "products_insert_auth"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- Solo el dueño o admin puede actualizar
DROP POLICY IF EXISTS "products_update_own" ON products;
CREATE POLICY "products_update_own"
  ON products FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- Solo el dueño o admin puede eliminar
DROP POLICY IF EXISTS "products_delete_own" ON products;
CREATE POLICY "products_delete_own"
  ON products FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- ============================================================
-- RLS: orders
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR lower(customer_email) = lower(auth.jwt() ->> 'email')
    OR public.is_admin()
  );

-- Solo admin puede actualizar pedidos
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- Storage: bucket product-images (público)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_product_images_select" ON storage.objects;
CREATE POLICY "storage_product_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "storage_product_images_insert" ON storage.objects;
CREATE POLICY "storage_product_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "storage_product_images_delete" ON storage.objects;
CREATE POLICY "storage_product_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin()
    )
  );
