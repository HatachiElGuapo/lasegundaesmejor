'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import type { ShippingAddress } from '@/types';

const EMPTY_FORM: ShippingAddress = {
  nombre: '',
  ciudad: '',
  direccion: '',
  telefono: '',
  notas: '',
};

function Field({
  label,
  name,
  value,
  onChange,
  required = true,
  as = 'input',
  placeholder,
}: {
  label: string;
  name: keyof ShippingAddress;
  value: string;
  onChange: (name: keyof ShippingAddress, value: string) => void;
  required?: boolean;
  as?: 'input' | 'textarea';
  placeholder?: string;
}) {
  const base =
    'w-full font-body text-sm bg-transparent border-b py-2.5 outline-none transition-colors duration-200 placeholder:text-[var(--color-border)] focus:border-[var(--color-ink)] resize-none';
  const style = { borderColor: 'var(--color-border)', color: 'var(--color-ink)' };

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-body text-[10px] tracking-[0.3em] uppercase"
        style={{ color: 'var(--color-muted)' }}
      >
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={base}
          style={style}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
          placeholder={placeholder}
          className={base}
          style={style}
        />
      )}
    </div>
  );
}

export default function CarritoPage() {
  const items      = useCartStore((s) => s.items);
  const total      = useCartStore((s) => s.total);
  const clearCart  = useCartStore((s) => s.clearCart);

  const [form, setForm]       = useState<ShippingAddress>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function handleField(name: keyof ShippingAddress, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shipping: form }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        throw new Error(data.error ?? 'Error al iniciar el pago');
      }
      clearCart();
      window.location.href = data.init_point;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  }

  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(total());

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-32 flex flex-col items-center justify-center gap-6 px-8 text-center">
        <p className="font-display italic text-3xl text-ink">Tu carrito está vacío</p>
        <Link
          href="/tienda"
          className="font-body text-[11px] tracking-[0.25em] uppercase px-8 py-3 border transition-colors duration-200 hover:bg-ink hover:text-bg"
          style={{ borderColor: 'var(--color-ink)', color: 'var(--color-ink)' }}
        >
          Ver colección
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-16 min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* Header */}
      <section
        className="px-8 md:px-16 lg:px-24 pt-16 pb-10 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p className="font-body text-[11px] tracking-[0.35em] uppercase mb-4" style={{ color: 'var(--color-accent)' }}>
          Último paso
        </p>
        <h1 className="font-display italic text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] text-ink">
          Datos de envío
        </h1>
      </section>

      <div className="px-8 md:px-16 lg:px-24 py-16 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 lg:gap-24 items-start">

        {/* ── FORMULARIO ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field
              label="Nombre completo"
              name="nombre"
              value={form.nombre}
              onChange={handleField}
              placeholder="María González"
            />
            <Field
              label="Teléfono"
              name="telefono"
              value={form.telefono}
              onChange={handleField}
              placeholder="300 123 4567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleField}
              placeholder="Bogotá, Medellín, Cali…"
            />
            <Field
              label="Dirección"
              name="direccion"
              value={form.direccion}
              onChange={handleField}
              placeholder="Calle 123 # 45-67, Apto 8"
            />
          </div>

          <Field
            label="Notas adicionales"
            name="notas"
            value={form.notas ?? ''}
            onChange={handleField}
            required={false}
            as="textarea"
            placeholder="Referencias, instrucciones de entrega, etc."
          />

          {/* Nota de envío */}
          <div
            className="p-6 border"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <p className="font-body text-[11px] tracking-[0.25em] uppercase mb-2" style={{ color: 'var(--color-accent)' }}>
              Envíos a todo Colombia
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              El costo de envío se calcula según tu ciudad y te lo confirmamos por WhatsApp antes de despachar.
              Trabajamos con Coordinadora y Servientrega a todo Colombia.
            </p>
          </div>

          {error && (
            <p className="font-body text-sm" style={{ color: '#C0392B' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !form.nombre || !form.ciudad || !form.direccion || !form.telefono}
            className="w-full md:w-auto md:self-start font-body text-[11px] tracking-[0.3em] uppercase px-12 py-4 transition-opacity duration-200 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-ink)', color: 'var(--color-bg)' }}
          >
            {loading ? 'Redirigiendo…' : 'Ir al pago'}
          </button>

        </form>

        {/* ── RESUMEN DEL PEDIDO ─────────────────────────────────────────── */}
        <aside
          className="border p-8 flex flex-col gap-6 sticky top-24"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p className="font-body text-[10px] tracking-[0.35em] uppercase" style={{ color: 'var(--color-muted)' }}>
            Tu pedido
          </p>

          <ul className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }} role="list">
            {items.map(({ product }) => {
              const price = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(product.price);
              return (
                <li key={product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div
                    className="relative w-16 h-20 flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <p className="font-display italic text-sm text-ink leading-snug truncate">{product.name}</p>
                    <p className="font-body text-[11px] tracking-[0.1em] uppercase" style={{ color: 'var(--color-muted)' }}>
                      Talla {product.size}
                    </p>
                    <p className="font-body text-sm text-ink">{price}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className="flex items-center justify-between pt-4 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="font-body text-[11px] tracking-[0.25em] uppercase" style={{ color: 'var(--color-muted)' }}>
              Subtotal
            </p>
            <p className="font-display italic text-2xl text-ink">{formattedTotal}</p>
          </div>

          <p className="font-body text-[11px]" style={{ color: 'var(--color-muted)' }}>
            + envío a confirmar por WhatsApp
          </p>
        </aside>

      </div>
    </main>
  );
}
