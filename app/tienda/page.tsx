import { supabase } from '@/lib/supabase';
import TiendaCatalog from '@/components/sections/TiendaCatalog';
import SunRays from '@/components/ui/SunRays';
import type { Product } from '@/types';

export const revalidate = 60; // ISR: refrescar cada 60 segundos

async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, description, price, category, subcategory, size, condition, images, in_stock, reference, created_at')
    .eq('in_stock', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[tienda] Error fetching products:', error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export default async function TiendaPage() {
  const products = await getProducts();

  return (
    <main className="pt-16">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-8 md:px-16 lg:px-24 pt-20 pb-12 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SunRays />
        <p
          className="font-body text-[11px] tracking-[0.35em] uppercase mb-5"
          style={{ color: 'var(--color-accent)' }}
        >
          Colección actual
        </p>
        <div className="flex items-end justify-between gap-8">
          <h1 className="font-display italic text-[clamp(2.5rem,7vw,6rem)] leading-[0.88] text-ink">
            La tienda
          </h1>
          <p
            className="hidden md:block font-body text-sm pb-2"
            style={{ color: 'var(--color-muted)' }}
          >
            {products.length} {products.length === 1 ? 'prenda' : 'prendas'}
          </p>
        </div>
      </section>

      {/* ── FILTROS + GRID (Client Component) ──────────────────────────── */}
      <TiendaCatalog products={products} />

    </main>
  );
}
