'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import type { Product } from '@/types';

// Alturas variables para el layout editorial asimétrico
const HEIGHTS = ['420px', '340px', '380px', '460px', '360px', '400px'];

interface FeaturedGridProps {
  products: Product[];
}

export default function FeaturedGrid({ products }: FeaturedGridProps) {
  return (
    <section className="py-24 px-8 md:px-16 lg:px-24" aria-label="Prendas destacadas">
      {/* Header */}
      <motion.div
        className="flex items-end justify-between mb-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <p className="font-body text-[11px] tracking-[0.35em] text-accent uppercase mb-3">
            Selección actual
          </p>
          <h2 className="font-display italic text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] text-ink">
            Piezas que<br />
            <span style={{ color: 'var(--color-accent)' }}>esperan</span> por ti
          </h2>
        </div>
        <Link
          href="/tienda"
          className="hidden md:inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-muted hover:text-ink transition-colors duration-200"
          aria-label="Ver toda la tienda"
        >
          Ver todo <span aria-hidden="true">→</span>
        </Link>
      </motion.div>

      {/* Grid asimétrico */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-end">
        {products.map((product, i) => (
          <motion.div
            key={product.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProductCard
              slug={product.slug}
              name={product.name}
              price={product.price}
              size={product.size}
              condition={product.condition}
              images={product.images}
              index={i}
              height={HEIGHTS[i % HEIGHTS.length]}
            />
          </motion.div>
        ))}
      </div>

      {/* CTA móvil */}
      <div className="mt-12 text-center md:hidden">
        <Link
          href="/tienda"
          className="font-body text-xs tracking-[0.2em] uppercase text-muted hover:text-ink transition-colors duration-200"
        >
          Ver toda la colección →
        </Link>
      </div>
    </section>
  );
}
