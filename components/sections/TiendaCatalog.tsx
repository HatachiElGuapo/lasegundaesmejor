'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ui/ProductCard';
import { CATEGORY_TREE } from '@/lib/categories';
import type { Product, ProductCategory, ProductSubcategory, ProductSize, ProductCondition } from '@/types';

const PAGE_SIZE = 24;

// ─── Tipos de filtros ─────────────────────────────────────────────────────────

type FilterCategory  = ProductCategory  | 'todas';
type FilterSub       = ProductSubcategory | 'todas';
type FilterSize      = ProductSize      | 'todas';
type FilterCondition = ProductCondition | 'todas';

const SIZES: { value: FilterSize; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'XS',    label: 'XS'   },
  { value: 'S',     label: 'S'    },
  { value: 'M',     label: 'M'    },
  { value: 'L',     label: 'L'    },
  { value: 'XL',    label: 'XL'   },
  { value: 'única', label: 'Única'},
];

const CONDITIONS: { value: FilterCondition; label: string }[] = [
  { value: 'todas',     label: 'Todas'     },
  { value: 'excelente', label: 'Excelente' },
  { value: 'buena',     label: 'Buena'     },
  { value: 'vintage',   label: 'Vintage'   },
];

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="font-body text-[11px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors duration-200"
              style={{
                borderColor:     active ? 'var(--color-ink)'  : 'var(--color-border)',
                backgroundColor: active ? 'var(--color-ink)'  : 'transparent',
                color:           active ? 'var(--color-bg)'   : 'var(--color-muted)',
              }}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      className="col-span-full flex flex-col items-center justify-center py-28 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true" className="mb-6 opacity-30">
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="32" x2="44" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <h3 className="font-display italic text-2xl text-ink mb-3">
        Ninguna prenda coincide
      </h3>
      <p className="font-body text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
        Prueba con otros filtros o explora toda la colección.
      </p>
      <button
        onClick={onReset}
        className="font-body text-xs tracking-[0.25em] uppercase px-6 py-3 border transition-colors duration-200 hover:bg-ink hover:text-bg"
        style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
      >
        Limpiar filtros
      </button>
    </motion.div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TiendaCatalog({ products }: { products: Product[] }) {
  const [category,  setCategory ] = useState<FilterCategory>('todas');
  const [sub,       setSub      ] = useState<FilterSub>('todas');
  const [size,      setSize     ] = useState<FilterSize>('todas');
  const [condition, setCondition] = useState<FilterCondition>('todas');
  const [page,      setPage     ] = useState(1);

  // Inicializar filtros desde URL params si vienen del Navbar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('cat') as FilterCategory | null;
    const subParam = params.get('sub') as FilterSub | null;
    if (catParam && CATEGORY_TREE.some((c) => c.value === catParam)) {
      setCategory(catParam);
    }
    if (subParam) setSub(subParam);
  }, []);

  // Al cambiar categoría principal, resetear subcategoría
  function handleCategoryChange(v: FilterCategory) {
    setCategory(v);
    setSub('todas');
  }

  const activeCategoryTree = CATEGORY_TREE.find((c) => c.value === category);

  const CATEGORY_OPTIONS: { value: FilterCategory; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    ...CATEGORY_TREE.map((c) => ({ value: c.value as FilterCategory, label: c.label })),
  ];

  const SUB_OPTIONS: { value: FilterSub; label: string }[] = activeCategoryTree
    ? [
        { value: 'todas', label: 'Todas' },
        ...activeCategoryTree.subcategories.map((s) => ({ value: s.value as FilterSub, label: s.label })),
      ]
    : [];

  const filtered = useMemo(() =>
    products.filter((p) =>
      (category  === 'todas' || p.category    === category)  &&
      (sub       === 'todas' || p.subcategory === sub)       &&
      (size      === 'todas' || p.size        === size)      &&
      (condition === 'todas' || p.condition   === condition)
    ),
    [products, category, sub, size, condition]
  );

  useEffect(() => { setPage(1); }, [category, sub, size, condition]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = category !== 'todas' || sub !== 'todas' || size !== 'todas' || condition !== 'todas';

  function resetFilters() {
    setCategory('todas');
    setSub('todas');
    setSize('todas');
    setCondition('todas');
  }

  function goToPage(n: number) {
    setPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {/* ── FILTROS ────────────────────────────────────────────────────── */}
      <section
        className="px-8 md:px-16 lg:px-24 py-8 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        aria-label="Filtros de productos"
      >
        <div className="flex flex-col gap-6">
          {/* Fila 1: Categoría principal */}
          <div className="flex flex-col md:flex-row gap-8 md:items-end">
            <FilterGroup
              label="Categoría"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={handleCategoryChange}
            />

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="self-start md:self-end font-body text-[10px] tracking-[0.25em] uppercase transition-colors duration-200 hover:text-ink whitespace-nowrap"
                style={{ color: 'var(--color-muted)' }}
              >
                Limpiar ✕
              </button>
            )}
          </div>

          {/* Fila 2: Subcategoría (solo cuando hay categoría activa) */}
          <AnimatePresence>
            {activeCategoryTree && (
              <motion.div
                key={category}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <FilterGroup
                  label={activeCategoryTree.label}
                  options={SUB_OPTIONS}
                  value={sub}
                  onChange={setSub}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fila 3: Talla + Condición */}
          <div className="flex flex-col md:flex-row gap-8 md:items-end pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <FilterGroup label="Talla"     options={SIZES}      value={size}      onChange={setSize}      />
            <FilterGroup label="Condición" options={CONDITIONS} value={condition}  onChange={setCondition} />
          </div>
        </div>
      </section>

      {/* ── GRID ───────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-16" aria-label="Productos">
        <p className="md:hidden font-body text-xs mb-8" style={{ color: 'var(--color-muted)' }}>
          {filtered.length} {filtered.length === 1 ? 'prenda' : 'prendas'}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12">
          <AnimatePresence mode="popLayout">
            {paginated.length === 0 ? (
              <EmptyState key="empty" onReset={resetFilters} />
            ) : (
              paginated.map((product, i) => (
                <motion.div
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, delay: i < 8 ? i * 0.05 : 0, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    size={product.size}
                    condition={product.condition}
                    images={product.images}
                    index={i}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── PAGINACIÓN ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-8 mt-20 pt-10 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="group flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-ink)' }}
              aria-label="Página anterior"
            >
              <span
                className="w-8 h-px transition-all duration-300 group-hover:w-12 group-disabled:group-hover:w-8"
                style={{ backgroundColor: 'var(--color-ink)' }}
              />
              Anterior
            </button>

            <span className="font-body text-xs" style={{ color: 'var(--color-muted)' }}>
              {page} / {totalPages}
            </span>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="group flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-ink)' }}
              aria-label="Página siguiente"
            >
              Siguiente
              <span
                className="w-8 h-px transition-all duration-300 group-hover:w-12"
                style={{ backgroundColor: 'var(--color-ink)' }}
              />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
