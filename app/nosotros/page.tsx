'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SunRays from '@/components/ui/SunRays';

// ─── Helpers ───────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ─── Placeholder SVG images ─────────────────────────────────────────────────

function MoodImage({
  palette,
  aspect = '3/4',
  label,
}: {
  palette: { bg: string; stroke: string };
  aspect?: string;
  label: string;
}) {
  return (
    <div className="w-full overflow-hidden" style={{ aspectRatio: aspect }}>
      <svg
        viewBox="0 0 300 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label={label}
        role="img"
      >
        <rect width="300" height="400" fill={palette.bg} />
        {/* Líneas decorativas boceto editorial */}
        <rect x="30"  y="40"  width="240" height="320" rx="2" fill="none" stroke={palette.stroke} strokeWidth="0.8" opacity="0.3" />
        <line x1="30"  y1="160" x2="270" y2="160" stroke={palette.stroke} strokeWidth="0.5" opacity="0.2" />
        <line x1="30"  y1="240" x2="270" y2="240" stroke={palette.stroke} strokeWidth="0.5" opacity="0.2" />
        <circle cx="150" cy="200" r="50" fill="none" stroke={palette.stroke} strokeWidth="1" opacity="0.2" />
        <line x1="100" y1="60"  x2="200" y2="60"  stroke={palette.stroke} strokeWidth="1.5" opacity="0.35" />
        <text x="150" y="375" textAnchor="middle" fill={palette.stroke} fontSize="8" opacity="0.35" fontFamily="serif" letterSpacing="4">
          LSEM
        </text>
      </svg>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

const VALORES = [
  {
    number: '01',
    title: 'Sostenibilidad real',
    body: 'La industria de la moda es una de las más contaminantes del mundo. Elegir segunda mano es elegir menos agua, menos carbono y menos basura textil. Cada compra aquí es un voto por un sistema diferente.',
  },
  {
    number: '02',
    title: 'Moda circular',
    body: 'Una prenda no muere cuando deja de usarse. La moda circular cierra el ciclo: lo que fue de alguien más puede ser tuyo, y luego de otra persona. El valor se mantiene, la basura se reduce.',
  },
  {
    number: '03',
    title: 'Identidad propia',
    body: 'Vestirnos igual que todos no nos hace más únicos. Aquí encontrarás piezas que no están en ningún centro comercial, con historia y carácter. Ropa que dice algo sobre quien la lleva.',
  },
  {
    number: '04',
    title: 'Precios accesibles',
    body: 'Moda de calidad no debería ser un privilegio. Curamos prendas en buen estado a precios justos para que más personas puedan vestir bien, gastar menos y contaminar menos al mismo tiempo.',
  },
];

const MOOD_PALETTES = [
  { bg: '#F0EAFF', stroke: '#9B6FD4' },
  { bg: '#EDE7DA', stroke: '#C8A96E' },
  { bg: '#F5F0E8', stroke: '#B07080' },
  { bg: '#E8E0D0', stroke: '#7B5BA6' },
  { bg: '#FFF0F4', stroke: '#C8A96E' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NosotrosPage() {
  return (
    <main className="pt-16">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-[70vh] flex flex-col justify-end px-8 md:px-16 lg:px-24 pb-20 border-b"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Encabezado nosotros"
      >
        <SunRays />
        <motion.p
          className="font-body text-[11px] tracking-[0.35em] uppercase mb-6"
          style={{ color: 'var(--color-accent)' }}
          {...fadeUp(0.1)}
        >
          Nuestra historia
        </motion.p>

        <motion.h1
          className="font-display italic text-[clamp(3.5rem,10vw,8.5rem)] leading-[0.88] text-ink text-balance mb-8 max-w-[900px]"
          {...fadeUp(0.2)}
        >
          Creemos que lo{' '}
          <span style={{ color: 'var(--color-accent)' }}>segundo</span>
          <br />siempre fue mejor.
        </motion.h1>

        <motion.div className="flex items-center gap-6" {...fadeUp(0.35)}>
          <div className="w-10 h-px" style={{ backgroundColor: 'var(--color-accent)' }} />
          <p className="font-body text-sm tracking-[0.15em] uppercase" style={{ color: 'var(--color-muted)' }}>
            Bogotá, Colombia — desde 2024
          </p>
        </motion.div>
      </section>

      {/* ── HISTORIA ─────────────────────────────────────────────────────── */}
      <section
        className="py-28 px-8 md:px-16 lg:px-24"
        aria-label="Historia de la marca"
      >
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.2fr] gap-16 lg:gap-28 items-center">

          {/* Imagen lateral */}
          <motion.div className="order-2 md:order-1" {...fadeUp(0.1)}>
            <MoodImage
              palette={MOOD_PALETTES[0]}
              aspect="3/4"
              label="Fotografía editorial de prenda curada"
            />
          </motion.div>

          {/* Texto */}
          <div className="order-1 md:order-2 space-y-6">
            <motion.p
              className="font-body text-[11px] tracking-[0.3em] uppercase"
              style={{ color: 'var(--color-accent)' }}
              {...fadeUp(0.05)}
            >
              Cómo empezó todo
            </motion.p>

            <motion.h2
              className="font-display italic text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-ink"
              {...fadeUp(0.15)}
            >
              Un clóset lleno.<br />Un planeta cansado.
            </motion.h2>

            <motion.div className="space-y-5 font-body text-base leading-relaxed" style={{ color: 'var(--color-muted)' }} {...fadeUp(0.25)}>
              <p>
                Lasegundaesmejor nació de una contradicción simple: los clósets están
                llenos de ropa que nadie usa, y los vertederos están llenos de ropa
                que nadie quiso. En algún punto entre esas dos realidades,
                vimos una oportunidad.
              </p>
              <p>
                Empezamos curando piezas con criterio editorial — no cualquier cosa,
                sino ropa con carácter. Blazers con historia, faldas que aguantan el
                tiempo, abrigos que dicen algo. Cada prenda pasa por un proceso de
                selección: estado, estética y coherencia con la identidad de la marca.
              </p>
              <p>
                No somos una tienda de ropa usada. Somos una curaduría de moda
                con alma propia, para personas que entienden que lo mejor
                no siempre es lo nuevo.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALORES ──────────────────────────────────────────────────────── */}
      <section
        className="py-24 px-8 md:px-16 lg:px-24 border-t border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        aria-label="Valores de la marca"
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.div className="mb-16" {...fadeUp(0)}>
            <p
              className="font-body text-[11px] tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-accent)' }}
            >
              En lo que creemos
            </p>
            <h2 className="font-display italic text-[clamp(2rem,5vw,4rem)] leading-[1] text-ink">
              Nuestros valores
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: 'var(--color-border)' }}>
            {VALORES.map((v, i) => (
              <motion.div
                key={v.number}
                className="p-8 flex flex-col gap-5"
                style={{ backgroundColor: 'var(--color-surface)' }}
                {...fadeUp(i * 0.1)}
              >
                <span
                  className="font-display text-4xl"
                  style={{ color: 'var(--color-accent)', opacity: 0.5 }}
                  aria-hidden="true"
                >
                  {v.number}
                </span>
                <div className="w-8 h-px" style={{ backgroundColor: 'var(--color-accent)' }} />
                <h3 className="font-display italic text-xl text-ink leading-tight">
                  {v.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {v.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOOD BOARD ───────────────────────────────────────────────────── */}
      <section
        className="py-28 px-8 md:px-16 lg:px-24"
        aria-label="Mood board editorial"
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.div className="mb-14" {...fadeUp(0)}>
            <p
              className="font-body text-[11px] tracking-[0.35em] uppercase mb-4"
              style={{ color: 'var(--color-accent)' }}
            >
              Estética y referentes
            </p>
            <h2 className="font-display italic text-[clamp(2rem,5vw,4rem)] leading-[1] text-ink">
              El mundo visual<br />de la marca
            </h2>
          </motion.div>

          {/* Grid asimétrico editorial */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
            {/* Col 1 — tall */}
            <motion.div className="col-span-1 row-span-2" {...fadeUp(0.05)}>
              <MoodImage palette={MOOD_PALETTES[0]} aspect="2/3" label="Prenda editorial — pieza uno" />
            </motion.div>

            {/* Col 2 — wide top */}
            <motion.div className="col-span-1 md:col-span-2" {...fadeUp(0.1)}>
              <MoodImage palette={MOOD_PALETTES[1]} aspect="16/9" label="Detalle de textura — pieza dos" />
            </motion.div>

            {/* Col 3 — square */}
            <motion.div className="hidden lg:block" {...fadeUp(0.15)}>
              <MoodImage palette={MOOD_PALETTES[2]} aspect="1/1" label="Accesorio curado — pieza tres" />
            </motion.div>

            {/* Col 4 — portrait */}
            <motion.div className="hidden lg:block" {...fadeUp(0.2)}>
              <MoodImage palette={MOOD_PALETTES[3]} aspect="3/4" label="Look completo — pieza cuatro" />
            </motion.div>

            {/* Col 2 — bottom */}
            <motion.div className="col-span-1" {...fadeUp(0.25)}>
              <MoodImage palette={MOOD_PALETTES[4]} aspect="1/1" label="Detalle de costura — pieza cinco" />
            </motion.div>

            {/* Col 3 — bottom wide */}
            <motion.div className="col-span-1 md:col-span-1 lg:col-span-2" {...fadeUp(0.3)}>
              <MoodImage palette={MOOD_PALETTES[1]} aspect="16/9" label="Ambiente de tienda — pieza seis" />
            </motion.div>
          </div>

          {/* Caption editorial */}
          <motion.p
            className="mt-6 font-body text-[10px] tracking-[0.3em] uppercase text-center"
            style={{ color: 'var(--color-muted)' }}
            {...fadeUp(0.35)}
          >
            Imágenes reales próximamente — placeholders editoriales
          </motion.p>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section
        className="py-28 px-8 md:px-16 lg:px-24 border-t text-center"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Llamado a la acción"
      >
        <motion.div className="max-w-2xl mx-auto space-y-8" {...fadeUp(0.1)}>
          <h2 className="font-display italic text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-ink">
            ¿Lista para encontrar<br />
            <span style={{ color: 'var(--color-accent)' }}>tu próxima pieza?</span>
          </h2>
          <p className="font-body text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Cada semana llegan prendas nuevas. La tuya podría estar esperándote.
          </p>
          <Link
            href="/tienda"
            className="inline-flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-bg px-8 py-4 transition-colors duration-300 hover:opacity-80"
            style={{ backgroundColor: 'var(--color-ink)' }}
            aria-label="Explorar la tienda"
          >
            Explorar la tienda
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
