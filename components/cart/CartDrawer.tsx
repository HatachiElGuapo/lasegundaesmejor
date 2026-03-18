'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

export default function CartDrawer() {
  const isOpen     = useCartStore((s) => s.isOpen);
  const closeCart  = useCartStore((s) => s.closeCart);
  const items      = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const total      = useCartStore((s) => s.total);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(total());

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'rgba(26,20,16,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            className="fixed top-0 right-0 h-full z-[70] flex flex-col w-full max-w-md shadow-2xl"
            style={{ backgroundColor: 'var(--color-bg)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-8 py-6 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <h2 className="font-display italic text-2xl text-ink">Carrito</h2>
                <p className="font-body text-[11px] tracking-[0.2em] uppercase mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="flex items-center justify-center w-9 h-9 transition-colors duration-200 hover:text-accent"
                style={{ color: 'var(--color-muted)' }}
                aria-label="Cerrar carrito"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="opacity-20">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p className="font-display italic text-xl text-ink">Tu carrito está vacío</p>
                  <p className="font-body text-sm" style={{ color: 'var(--color-muted)' }}>
                    Explora la colección y agrega tus prendas favoritas.
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-2 font-body text-xs tracking-[0.25em] uppercase px-6 py-3 border transition-colors duration-200 hover:bg-ink hover:text-bg"
                    style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
                  >
                    Ver colección
                  </button>
                </div>
              ) : (
                <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }} role="list">
                  {items.map(({ product }) => {
                    const price = new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      maximumFractionDigits: 0,
                    }).format(product.price);

                    return (
                      <li
                        key={product.id}
                        className="flex gap-4 px-8 py-5"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <div
                          className="relative flex-shrink-0 w-20 h-24 overflow-hidden"
                          style={{ backgroundColor: 'var(--color-surface)' }}
                        >
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: 'var(--color-border)' }} />
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <p className="font-display italic text-base text-ink leading-snug truncate">
                              {product.name}
                            </p>
                            <p className="font-body text-[11px] tracking-[0.15em] uppercase mt-1" style={{ color: 'var(--color-muted)' }}>
                              Talla {product.size}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="font-body text-sm font-medium text-ink">{price}</p>
                            <button
                              onClick={() => removeItem(product.id)}
                              className="font-body text-[10px] tracking-[0.2em] uppercase transition-colors duration-200 hover:text-ink"
                              style={{ color: 'var(--color-muted)' }}
                              aria-label={`Eliminar ${product.name} del carrito`}
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="px-8 py-6 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <p className="font-body text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--color-muted)' }}>
                    Subtotal
                  </p>
                  <p className="font-display italic text-xl text-ink">{formattedTotal}</p>
                </div>
                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="block w-full text-center font-body text-[11px] tracking-[0.3em] uppercase py-4 transition-opacity duration-200"
                  style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-bg)' }}
                >
                  Ir al checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
