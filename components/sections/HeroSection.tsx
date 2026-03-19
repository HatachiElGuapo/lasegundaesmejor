'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import SunRays from '@/components/ui/SunRays';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      style={{
        background: '#FFD6E0',
      }}
      aria-label="Hero principal"
    >
      {/* Rayos desde esquina superior izquierda */}
      <SunRays />

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Acento dorado — línea superior */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-accent opacity-40"
        initial={{ scaleX: 0, transformOrigin: 'left' }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Número editorial — decorativo */}
      <motion.span
        className="absolute top-12 right-10 font-display text-[11px] tracking-[0.4em] text-accent opacity-50 uppercase"
        custom={0.2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        Vol. I — 2025
      </motion.span>

      {/* Contenido principal */}
      <div className="relative z-10 px-8 pb-20 md:px-16 lg:px-24 max-w-[1400px]">
        {/* Eyebrow */}
        <motion.p
          className="font-body text-[11px] tracking-[0.35em] text-accent uppercase mb-8"
          custom={0.1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Moda circular · Bogotá, Colombia
        </motion.p>

        {/* Headline */}
        <motion.h1
          className="font-display italic text-[clamp(4rem,12vw,9.5rem)] leading-[0.88] text-ink text-balance mb-10"
          custom={0.25}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Lo segundo
          <br />
          <span style={{ color: 'var(--color-accent)' }}>siempre</span>
          <br />
          fue mejor.
        </motion.h1>

        {/* Separador */}
        <motion.div
          className="w-16 h-px bg-accent mb-8"
          custom={0.4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        />

        {/* Subtítulo */}
        <motion.p
          className="font-body text-base md:text-lg text-muted max-w-md mb-12 leading-relaxed"
          custom={0.5}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Piezas únicas que esperaban a alguien como tú.
        </motion.p>

        {/* CTA */}
        <motion.div
          custom={0.65}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Link
            href="/tienda"
            className="inline-flex items-center gap-4 font-body text-sm tracking-[0.2em] uppercase text-surface bg-accent px-8 py-4 hover:bg-ink hover:text-surface transition-colors duration-300"
            aria-label="Ir a la tienda"
          >
            Explorar colección
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Línea inferior con scroll hint */}
      <motion.div
        className="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center gap-3"
        custom={0.9}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.div
          className="w-px h-10 bg-accent/40"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="font-body text-[10px] tracking-[0.3em] text-ink/30 uppercase">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
