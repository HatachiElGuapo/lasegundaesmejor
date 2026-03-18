'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SunRays from '@/components/ui/SunRays';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

// ─── Contact link component ───────────────────────────────────────────────────

function ContactLink({
  href,
  icon,
  label,
  sublabel,
  external = true,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="group flex items-center gap-5 py-6 border-b transition-colors duration-200 hover:text-accent"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink)' }}
      aria-label={`${label} — ${sublabel}`}
    >
      <span className="flex-shrink-0 transition-colors duration-200">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <p className="font-display italic text-xl truncate">
          {sublabel}
        </p>
      </div>
      <span className="font-body text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" aria-hidden="true">
        →
      </span>
    </a>
  );
}

// ─── Form ────────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'success';

function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nombre  = (fd.get('nombre')  as string).trim();
    const email   = (fd.get('email')   as string).trim();
    const mensaje = (fd.get('mensaje') as string).trim();

    const newErrors: Record<string, boolean> = {};
    if (!nombre)  newErrors.nombre  = true;
    if (!email)   newErrors.email   = true;
    if (!mensaje) newErrors.mensaje = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setState('success');
  }

  if (state === 'success') {
    return (
      <motion.div
        className="flex flex-col items-start gap-4 py-12"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="font-display italic text-5xl" style={{ color: 'var(--color-accent)' }}>✓</span>
        <h3 className="font-display italic text-2xl text-ink">Mensaje recibido</h3>
        <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Gracias por escribirnos. Te respondemos pronto por el medio que prefieras.
        </p>
      </motion.div>
    );
  }

  const inputBase =
    'w-full bg-transparent border-b py-3 font-body text-sm text-ink placeholder:text-muted/50 outline-none transition-colors duration-200 focus:border-ink';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <div>
        <label htmlFor="nombre" className="block font-body text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--color-muted)' }}>
          Nombre *
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Tu nombre"
          className={inputBase}
          style={{ borderColor: errors.nombre ? '#f87171' : 'var(--color-border)' }}
          onChange={() => setErrors((e) => ({ ...e, nombre: false }))}
        />
        {errors.nombre && (
          <p className="mt-1 font-body text-[10px] text-red-400">Campo requerido</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block font-body text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--color-muted)' }}>
          Correo electrónico *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          className={inputBase}
          style={{ borderColor: errors.email ? '#f87171' : 'var(--color-border)' }}
          onChange={() => setErrors((e) => ({ ...e, email: false }))}
        />
        {errors.email && (
          <p className="mt-1 font-body text-[10px] text-red-400">Campo requerido</p>
        )}
      </div>

      <div>
        <label htmlFor="mensaje" className="block font-body text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'var(--color-muted)' }}>
          Mensaje *
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder="¿En qué podemos ayudarte?"
          className={`${inputBase} resize-none`}
          style={{ borderColor: errors.mensaje ? '#f87171' : 'var(--color-border)' }}
          onChange={() => setErrors((e) => ({ ...e, mensaje: false }))}
        />
        {errors.mensaje && (
          <p className="mt-1 font-body text-[10px] text-red-400">Campo requerido</p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-3 font-body text-xs tracking-[0.25em] uppercase text-bg px-8 py-4 transition-opacity duration-200 hover:opacity-75"
        style={{ backgroundColor: 'var(--color-ink)' }}
      >
        Enviar mensaje
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ContactoPage() {
  return (
    <main className="pt-16">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-8 md:px-16 lg:px-24 pt-20 pb-16 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <SunRays />
        <motion.p
          className="font-body text-[11px] tracking-[0.35em] uppercase mb-5"
          style={{ color: 'var(--color-accent)' }}
          {...fadeUp(0.05)}
        >
          Hablemos
        </motion.p>
        <motion.h1
          className="font-display italic text-[clamp(3rem,9vw,7.5rem)] leading-[0.88] text-ink"
          {...fadeUp(0.15)}
        >
          Escríbenos,<br />
          <span style={{ color: 'var(--color-accent)' }}>estamos aquí.</span>
        </motion.h1>
      </section>

      {/* ── CONTENIDO ────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-[1fr_1.4fr] gap-16 lg:gap-28">

          {/* Columna izquierda — canales de contacto */}
          <motion.div {...fadeUp(0.1)}>
            <p
              className="font-body text-[10px] tracking-[0.3em] uppercase mb-8"
              style={{ color: 'var(--color-muted)' }}
            >
              Dónde encontrarnos
            </p>

            <div>
              <ContactLink
                href="https://instagram.com/lasegundaesmejor"
                icon={<IconInstagram />}
                label="Instagram"
                sublabel="@lasegundaesmejor"
              />
              <ContactLink
                href="https://wa.me/573006709840"
                icon={<IconWhatsApp />}
                label="WhatsApp"
                sublabel="+57 300 670 9840"
              />
              <ContactLink
                href="mailto:hola@lasegundaesmejor.co"
                icon={<IconEmail />}
                label="Correo"
                sublabel="hola@lasegundaesmejor.co"
                external={false}
              />
            </div>

            {/* Nota de respuesta */}
            <motion.p
              className="mt-10 font-body text-sm leading-relaxed"
              style={{ color: 'var(--color-muted)' }}
              {...fadeUp(0.25)}
            >
              Respondemos en menos de 24 horas. Si tienes dudas sobre una prenda,
              talla o envío, escríbenos por WhatsApp para una respuesta más rápida.
            </motion.p>

            {/* Separador editorial */}
            <motion.div className="mt-12 flex items-center gap-4" {...fadeUp(0.3)}>
              <div className="w-8 h-px" style={{ backgroundColor: 'var(--color-accent)' }} />
              <p className="font-display italic text-sm" style={{ color: 'var(--color-muted)' }}>
                Bogotá, Colombia
              </p>
            </motion.div>
          </motion.div>

          {/* Columna derecha — formulario */}
          <motion.div {...fadeUp(0.2)}>
            <p
              className="font-body text-[10px] tracking-[0.3em] uppercase mb-8"
              style={{ color: 'var(--color-muted)' }}
            >
              O déjanos un mensaje
            </p>
            <ContactForm />
          </motion.div>

        </div>
      </section>

    </main>
  );
}
