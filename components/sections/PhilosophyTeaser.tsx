'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PhilosophyTeaser() {
  return (
    <section className="py-32 px-8 md:px-16 lg:px-24 overflow-hidden" aria-label="Filosofía de la marca">
      <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_auto] gap-16 items-end">

        {/* Cita + párrafo */}
        <div>
          {/* Comilla decorativa */}
          <motion.span
            className="block font-display text-[8rem] leading-none select-none mb-[-2rem]"
            style={{ color: 'var(--color-accent)', opacity: 0.35 }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 0.35, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
          >
            "
          </motion.span>

          {/* Cita */}
          <motion.blockquote
            className="font-display italic text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-ink text-balance mb-10"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            La mejor ropa ya existe.
            <br />
            Solo necesita <span style={{ color: 'var(--color-accent)' }}>un nuevo dueño.</span>
          </motion.blockquote>

          {/* Separador */}
          <motion.div
            className="w-12 h-px mb-8"
            style={{ backgroundColor: 'var(--color-accent)' }}
            initial={{ scaleX: 0, transformOrigin: 'left' }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Párrafo */}
          <motion.p
            className="font-body text-base md:text-lg text-muted max-w-xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Somos una tienda de ropa de segunda mano con curaduría editorial.
            Cada prenda pasa por una selección rigurosa: buen estado, carácter propio
            y una historia que merece continuar. Creemos que vestir bien
            y vivir de forma sostenible no son ideas opuestas.
          </motion.p>
        </div>

        {/* CTA lateral */}
        <motion.div
          className="flex md:flex-col items-center md:items-end gap-6 md:gap-8"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Línea vertical decorativa — solo desktop */}
          <div
            className="hidden md:block w-px h-24 self-end"
            style={{ backgroundColor: 'var(--color-border)' }}
            aria-hidden="true"
          />

          <Link
            href="/nosotros"
            className="inline-flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-ink border px-6 py-4 hover:bg-ink hover:text-bg transition-colors duration-300 whitespace-nowrap"
            style={{ borderColor: 'var(--color-ink)' }}
            aria-label="Conocer más sobre lasegundaesmejor"
          >
            Nuestra historia
            <span aria-hidden="true">→</span>
          </Link>

          {/* Dato editorial */}
          <div className="hidden md:block text-right">
            <p className="font-display italic text-3xl text-ink">100%</p>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-muted mt-1">
              segunda mano
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
