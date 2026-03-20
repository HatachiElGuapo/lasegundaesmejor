'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { formatCOP, PlaceholderImage } from '@/components/ui/ProductCard';
import type { Product } from '@/types';

const CONDITION_LABEL = {
  excelente: 'Excelente estado',
  buena:     'Buen estado',
  vintage:   'Pieza vintage',
};

const CONDITION_DESC = {
  excelente: 'Sin señales visibles de uso. Como nueva.',
  buena:     'Uso mínimo. Pequeños detalles que le dan carácter.',
  vintage:   'Historia visible en cada hilo. Irrepetible.',
};

// ─── Galería ──────────────────────────────────────────────────────────────────

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen principal */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3/4', backgroundColor: 'var(--color-surface)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {images[active] ? (
              <Image
                src={images[active]}
                alt={`${name} — foto ${active + 1}`}
                fill
                priority={active === 0}
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderImage index={0} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Indicador de posición */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                className="transition-all duration-200"
                style={{
                  width:           i === active ? '20px' : '6px',
                  height:          '6px',
                  backgroundColor: i === active ? 'var(--color-bg)' : 'rgba(245,240,232,0.5)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Miniatura ${i + 1}`}
              className="relative flex-shrink-0 overflow-hidden transition-opacity duration-200"
              style={{
                width:   '72px',
                height:  '96px',
                opacity: i === active ? 1 : 0.5,
                outline: i === active ? '1.5px solid var(--color-ink)' : 'none',
                outlineOffset: '2px',
              }}
            >
              <Image
                src={src}
                alt={`${name} miniatura ${i + 1}`}
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Botón de carrito ─────────────────────────────────────────────────────────

function AddToCartButton({ product }: { product: Product }) {
  const { addItem, isInCart } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(product.id);

  function handleAdd() {
    if (inCart || justAdded) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  }

  return (
    <div className="space-y-3">
      <motion.button
        onClick={handleAdd}
        disabled={inCart}
        whileTap={inCart ? {} : { scale: 0.98 }}
        className="w-full font-body text-sm tracking-[0.25em] uppercase py-4 px-8 transition-all duration-300"
        style={{
          backgroundColor: inCart ? 'var(--color-muted)' : 'var(--color-ink)',
          color:           'var(--color-bg)',
          cursor:          inCart ? 'default' : 'pointer',
        }}
        aria-label={inCart ? 'Prenda ya en el carrito' : 'Agregar al carrito'}
      >
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Agregada al carrito
            </motion.span>
          ) : inCart ? (
            <motion.span key="in-cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Ya está en tu carrito
            </motion.span>
          ) : (
            <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Agregar al carrito
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <p className="font-body text-[10px] tracking-[0.2em] uppercase text-center" style={{ color: 'var(--color-muted)' }}>
        Solo queda 1 unidad — no se reserva
      </p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-0 min-h-screen">

      {/* ── GALERÍA ────────────────────────────────────────────────────── */}
      <motion.div
        className="lg:sticky lg:top-16 self-start px-8 md:px-12 lg:px-16 py-12 lg:py-16"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Gallery images={product.images ?? []} name={product.name} />
      </motion.div>

      {/* ── DETALLES ───────────────────────────────────────────────────── */}
      <motion.div
        className="px-8 md:px-12 lg:px-16 py-12 lg:py-16 flex flex-col justify-start border-l"
        style={{ borderColor: 'var(--color-border)' }}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Categoría + condición */}
        <div className="flex items-center justify-between mb-8">
          <span className="font-body text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--color-accent)' }}>
            {product.category}
          </span>
          <span
            className="font-body text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            {CONDITION_LABEL[product.condition]}
          </span>
        </div>

        {/* Nombre */}
        <h1 className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-[1.0] text-ink mb-6">
          {product.name}
        </h1>

        {/* Precio */}
        <p className="font-body text-3xl font-medium text-ink mb-10">
          {formatCOP(product.price)}
        </p>

        {/* Separador */}
        <div className="w-full h-px mb-10" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Descripción */}
        <div className="mb-10">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: 'var(--color-muted)' }}>
            La historia
          </p>
          <p className="font-body text-base leading-relaxed" style={{ color: 'var(--color-ink)' }}>
            {product.description}
          </p>
        </div>

        {/* Talla + condición + referencia */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--color-muted)' }}>
              Talla
            </p>
            <p className="font-display italic text-2xl text-ink">
              {product.size}
            </p>
          </div>
          <div>
            <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--color-muted)' }}>
              Estado
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
              {CONDITION_DESC[product.condition]}
            </p>
          </div>
        </div>

        {/* Referencia */}
        {product.reference && (
          <p className="font-body text-[10px] tracking-[0.25em] uppercase -mt-4 mb-10" style={{ color: 'var(--color-muted)' }}>
            Ref. <span className="font-mono">{product.reference}</span>
          </p>
        )}

        {/* Separador */}
        <div className="w-full h-px mb-10" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* CTA */}
        <AddToCartButton product={product} />

        {/* Nota filosófica */}
        <motion.p
          className="font-display italic text-sm mt-10 leading-relaxed text-center"
          style={{ color: 'var(--color-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          &ldquo;Lo segundo no es menos —<br />es lo que ya tiene alma.&rdquo;
        </motion.p>
      </motion.div>
    </div>
  );
}
