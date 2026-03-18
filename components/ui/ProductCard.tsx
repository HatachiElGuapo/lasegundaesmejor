import Image from 'next/image';
import Link from 'next/link';
import type { ProductCondition, ProductSize } from '@/types';

const CONDITION_LABEL: Record<ProductCondition, string> = {
  excelente: 'Excelente',
  buena:     'Buena',
  vintage:   'Vintage',
};

const PALETTES = [
  { bg: '#EDE7DA', lines: '#C8A96E' },
  { bg: '#F0EAFF', lines: '#9B6FD4' },
  { bg: '#E8E0D0', lines: '#B8962E' },
  { bg: '#F5F0E8', lines: '#C8A96E' },
  { bg: '#FFF0F4', lines: '#B07080' },
  { bg: '#E8F0E0', lines: '#7B9B6B' },
];

export function formatCOP(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);
}

export function PlaceholderImage({ index }: { index: number }) {
  const { bg, lines } = PALETTES[index % PALETTES.length];
  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <rect width="300" height="400" fill={bg} />
      <line x1="60"  y1="80"  x2="240" y2="80"  stroke={lines} strokeWidth="1"   opacity="0.5"  />
      <line x1="80"  y1="120" x2="220" y2="120" stroke={lines} strokeWidth="0.5" opacity="0.3"  />
      <rect x="90"  y="140" width="120" height="160" rx="4" fill="none" stroke={lines} strokeWidth="1.5" opacity="0.4" />
      <line x1="90"  y1="220" x2="210" y2="220" stroke={lines} strokeWidth="0.5" opacity="0.25" />
      <line x1="100" y1="240" x2="200" y2="240" stroke={lines} strokeWidth="0.5" opacity="0.25" />
      <line x1="110" y1="260" x2="190" y2="260" stroke={lines} strokeWidth="0.5" opacity="0.25" />
      <circle cx="150" cy="100" r="12" fill="none" stroke={lines} strokeWidth="1" opacity="0.3"  />
      <text x="150" y="360" textAnchor="middle" fill={lines} fontSize="9" opacity="0.4" fontFamily="serif" letterSpacing="3">
        LSEM
      </text>
    </svg>
  );
}

export interface ProductCardData {
  slug:      string;
  name:      string;
  price:     number;
  size:      ProductSize;
  condition: ProductCondition;
  images?:   string[];
  index:     number;
  height?:   string;
}

export default function ProductCard({ slug, name, price, size, condition, images, index, height = '360px' }: ProductCardData) {
  const imageUrl = images?.[0];
  return (
    <Link href={`/tienda/${slug}`} className="group block" aria-label={`Ver ${name}`}>
      <div
        className="relative w-full overflow-hidden mb-4"
        style={{ height, backgroundColor: 'var(--color-surface)' }}
      >
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderImage index={index} />
          )}
        </div>
        <span
          className="absolute top-3 left-3 font-body text-[10px] tracking-[0.2em] uppercase px-2 py-1 backdrop-blur-sm"
          style={{ color: 'var(--color-ink)', backgroundColor: 'rgba(237,231,218,0.85)' }}
        >
          {CONDITION_LABEL[condition]}
        </span>
      </div>
      <div className="space-y-1">
        <p className="font-body text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--color-muted)' }}>
          Talla {size}
        </p>
        <h3 className="font-display text-lg leading-tight text-ink group-hover:text-accent transition-colors duration-200">
          {name}
        </h3>
        <p className="font-body text-sm font-medium text-ink">
          {formatCOP(price)}
        </p>
      </div>
    </Link>
  );
}
