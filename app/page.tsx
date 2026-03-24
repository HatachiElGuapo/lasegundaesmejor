export const revalidate = 3600; // revalida cada hora

import HeroSection from '@/components/sections/HeroSection';
import FeaturedGrid from '@/components/sections/FeaturedGrid';
import PhilosophyTeaser from '@/components/sections/PhilosophyTeaser';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .not('images', 'is', null)
    .not('images', 'eq', '{}')
    .order('price', { ascending: false })
    .limit(6);

  if (error || !data) return [];
  return data as Product[];
}

export default async function Home() {
  const products = await getFeaturedProducts();

  return (
    <main>
      <HeroSection />
      <FeaturedGrid products={products} />
      <PhilosophyTeaser />
    </main>
  );
}
