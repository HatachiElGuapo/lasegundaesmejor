'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { CATEGORY_TREE } from '@/lib/categories';

export default function Navbar() {
  const pathname  = usePathname();
  const items     = useCartStore((s) => s.items);
  const openCart  = useCartStore((s) => s.openCart);
  const count     = items.length;

  // Scroll: fondo sólido al bajar
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menú móvil
  const [menuOpen, setMenuOpen] = useState(false);
  // Submenú de tienda en móvil
  const [tiendaOpen, setTiendaOpen] = useState(false);
  // Dropdown tienda en desktop
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú móvil al navegar
  function closeMobile() {
    setMenuOpen(false);
    setTiendaOpen(false);
  }

  const isScrolledOrOpen = scrolled || menuOpen || dropdownOpen;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: isScrolledOrOpen ? 'var(--color-bg)' : 'transparent',
        borderBottom: isScrolledOrOpen ? '1px solid var(--color-border)' : '1px solid transparent',
      }}
    >
      <nav
        className="max-w-[1400px] mx-auto px-8 md:px-16 h-16 flex items-center justify-between"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display italic text-xl text-ink tracking-tight hover:text-accent transition-colors duration-200"
          aria-label="Ir al inicio — lasegundaesmejor"
        >
          lasegundaesmejor
        </Link>

        {/* Links — desktop */}
        <ul className="hidden md:flex items-center gap-10" role="list">
          {/* Tienda con dropdown */}
          <li className="relative">
            <div ref={dropdownRef}>
            <button
              className="relative flex items-center gap-1 font-body text-[11px] tracking-[0.25em] uppercase text-ink/70 hover:text-ink transition-colors duration-200 group"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              onClick={() => setDropdownOpen((v) => !v)}
            >
              Tienda
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200"
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {/* Underline activo */}
              <span
                className="absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300"
                style={{ width: pathname.startsWith('/tienda') ? '100%' : '0%' }}
              />
              {/* Underline hover */}
              <span className="absolute -bottom-1 left-0 h-px bg-ink/30 w-0 group-hover:w-full transition-all duration-300" />
            </button>

            {/* Mega-dropdown */}
            {dropdownOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[640px] border shadow-xl p-8"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                }}
              >
                {/* Flecha decorativa */}
                <div
                  className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border-t border-l"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                />

                <div className="grid grid-cols-4 gap-6">
                  {CATEGORY_TREE.map((cat) => (
                    <div key={cat.value}>
                      <Link
                        href={`/tienda?cat=${cat.value}`}
                        className="block font-body text-[10px] tracking-[0.3em] uppercase mb-3 hover:text-accent transition-colors duration-200"
                        style={{ color: 'var(--color-ink)' }}
                        onClick={() => setDropdownOpen(false)}
                      >
                        {cat.label}
                      </Link>
                      <ul className="flex flex-col gap-2" role="list">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.value}>
                            <Link
                              href={`/tienda?cat=${cat.value}&sub=${sub.value}`}
                              className="font-body text-[11px] hover:text-ink transition-colors duration-200"
                              style={{ color: 'var(--color-muted)' }}
                              onClick={() => setDropdownOpen(false)}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Ver todo */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <Link
                    href="/tienda"
                    className="font-body text-[10px] tracking-[0.25em] uppercase hover:text-accent transition-colors duration-200"
                    style={{ color: 'var(--color-muted)' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Ver toda la colección →
                  </Link>
                </div>
              </div>
            )}
            </div>
          </li>

          {/* Nosotros */}
          <li>
            <Link
              href="/nosotros"
              className="relative font-body text-[11px] tracking-[0.25em] uppercase text-ink/70 hover:text-ink transition-colors duration-200 group"
              aria-current={pathname === '/nosotros' ? 'page' : undefined}
            >
              Nosotros
              <span
                className="absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300"
                style={{ width: pathname === '/nosotros' ? '100%' : '0%' }}
              />
              <span className="absolute -bottom-1 left-0 h-px bg-ink/30 w-0 group-hover:w-full transition-all duration-300" />
            </Link>
          </li>

          {/* Contacto */}
          <li>
            <Link
              href="/contacto"
              className="relative font-body text-[11px] tracking-[0.25em] uppercase text-ink/70 hover:text-ink transition-colors duration-200 group"
              aria-current={pathname === '/contacto' ? 'page' : undefined}
            >
              Contacto
              <span
                className="absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300"
                style={{ width: pathname === '/contacto' ? '100%' : '0%' }}
              />
              <span className="absolute -bottom-1 left-0 h-px bg-ink/30 w-0 group-hover:w-full transition-all duration-300" />
            </Link>
          </li>
        </ul>

        {/* Derecha: carrito + hamburger */}
        <div className="flex items-center gap-4">
          {/* Carrito */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 text-ink hover:text-accent transition-colors duration-200"
            aria-label={`Carrito — ${count} ${count === 1 ? 'prenda' : 'prendas'}`}
          >
            <CartIcon />
            {count > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-body text-[10px] font-semibold text-bg"
                style={{ backgroundColor: 'var(--color-accent)' }}
                aria-hidden="true"
              >
                {count}
              </span>
            )}
          </button>

          {/* Hamburger — móvil */}
          <button
            className="md:hidden flex flex-col gap-[5px] justify-center items-center w-10 h-10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            <span
              className="block w-5 h-px bg-ink transition-all duration-300 origin-center"
              style={{ transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none' }}
            />
            <span
              className="block w-5 h-px bg-ink transition-all duration-300"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-px bg-ink transition-all duration-300 origin-center"
              style={{ transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }}
            />
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: menuOpen ? '600px' : '0px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: menuOpen ? '1px solid var(--color-border)' : 'none',
        }}
      >
        <ul className="px-8 py-6 flex flex-col gap-6" role="list">
          {/* Tienda expandible */}
          <li>
            <button
              className="flex items-center gap-2 font-body text-[11px] tracking-[0.3em] uppercase text-ink/70 hover:text-ink transition-colors duration-200"
              onClick={() => setTiendaOpen((v) => !v)}
              aria-expanded={tiendaOpen}
            >
              Tienda
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                aria-hidden="true"
                className="transition-transform duration-200"
                style={{ transform: tiendaOpen ? 'rotate(180deg)' : 'none' }}
              >
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {tiendaOpen && (
              <div className="mt-4 pl-4 flex flex-col gap-5">
                <Link
                  href="/tienda"
                  className="font-body text-[10px] tracking-[0.25em] uppercase hover:text-accent transition-colors duration-200"
                  style={{ color: 'var(--color-muted)' }}
                  onClick={closeMobile}
                >
                  Ver todo
                </Link>
                {CATEGORY_TREE.map((cat) => (
                  <div key={cat.value}>
                    <Link
                      href={`/tienda?cat=${cat.value}`}
                      className="block font-body text-[10px] tracking-[0.25em] uppercase mb-2 hover:text-accent transition-colors duration-200"
                      style={{ color: 'var(--color-ink)' }}
                      onClick={closeMobile}
                    >
                      {cat.label}
                    </Link>
                    <ul className="flex flex-col gap-1.5 pl-3" role="list">
                      {cat.subcategories.map((sub) => (
                        <li key={sub.value}>
                          <Link
                            href={`/tienda?cat=${cat.value}&sub=${sub.value}`}
                            className="font-body text-[11px] hover:text-ink transition-colors duration-200"
                            style={{ color: 'var(--color-muted)' }}
                            onClick={closeMobile}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </li>

          <li>
            <Link
              href="/nosotros"
              className="font-body text-[11px] tracking-[0.3em] uppercase text-ink/70 hover:text-ink transition-colors duration-200"
              aria-current={pathname === '/nosotros' ? 'page' : undefined}
              onClick={closeMobile}
            >
              Nosotros
            </Link>
          </li>

          <li>
            <Link
              href="/contacto"
              className="font-body text-[11px] tracking-[0.3em] uppercase text-ink/70 hover:text-ink transition-colors duration-200"
              aria-current={pathname === '/contacto' ? 'page' : undefined}
              onClick={closeMobile}
            >
              Contacto
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
