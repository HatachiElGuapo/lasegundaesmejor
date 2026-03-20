import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductDetail from '@/components/sections/ProductDetail';
import type { Product } from '@/types';

interface Props {
  params: { slug: string };
}

export const revalidate = 0;

export async function generateMetadata({ params }: Props) {
  const { data } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', params.slug)
    .single();

  if (!data) return { title: 'Prenda no encontrada' };

  return {
    title: `${data.name} — La Segunda Es Mejor`,
    description: data.description,
  };
}

async function getProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, slug, name, description, price, category, size, condition, images, in_stock, reference, created_at')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Product;
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  return (
    <main className="pt-16">

      {/* Breadcrumb */}
      <nav
        className="px-8 md:px-16 lg:px-24 py-5 border-b flex items-center gap-3"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Ruta de navegación"
      >
        <Link
          href="/tienda"
          className="font-body text-[10px] tracking-[0.3em] uppercase transition-colors duration-200 hover:text-ink"
          style={{ color: 'var(--color-muted)' }}
        >
          La tienda
        </Link>
        <span style={{ color: 'var(--color-border)' }}>—</span>
        <span
          className="font-body text-[10px] tracking-[0.3em] uppercase truncate max-w-[200px]"
          style={{ color: 'var(--color-ink)' }}
        >
          {product.name}
        </span>
      </nav>

      <ProductDetail product={product} />

    </main>
  );
}
