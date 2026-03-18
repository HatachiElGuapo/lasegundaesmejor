# lasegundaesmejor — Proyecto Web

## ¿Qué es este proyecto?
Tienda online de ropa de segunda mano con estética editorial / revista de moda de lujo.
La marca celebra la idea de que "lo segundo es mejor": sostenibilidad, historia y carácter en cada prenda.

---

## Stack tecnológico

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + CSS Variables para el sistema de diseño
- **Animaciones**: Framer Motion
- **Estado del carrito**: Zustand
- **Base de datos / CMS**: Supabase (productos, inventario, órdenes)
- **Pagos**: MercadoPago (SDK oficial: `@mercadopago/sdk-react`)
- **Deploy**: Vercel

---

## Estructura de carpetas

```
lasegundaesmejor/
├── app/
│   ├── page.tsx                  # Home / landing
│   ├── tienda/
│   │   ├── page.tsx              # Catálogo completo
│   │   └── [slug]/page.tsx       # Página individual de producto
│   ├── nosotros/page.tsx         # Sobre la marca / filosofía
│   ├── contacto/page.tsx         # Contacto y redes
│   └── carrito/page.tsx          # Carrito de compras
├── components/
│   ├── ui/                       # Botones, badges, inputs base
│   ├── layout/                   # Navbar, Footer
│   ├── sections/                 # Hero, FeaturedGrid, AboutBlock, etc.
│   └── cart/                     # CartDrawer, CartItem, CartSummary
├── lib/
│   ├── supabase.ts               # Cliente Supabase
│   ├── mercadopago.ts            # Cliente MercadoPago
│   ├── categories.ts             # Árbol de categorías/subcategorías (fuente de verdad)
│   └── utils.ts                  # Helpers
├── store/
│   └── cartStore.ts              # Zustand — estado global del carrito
├── types/
│   └── index.ts                  # Product, CartItem, Order types
└── public/
    └── fonts/                    # Fuentes locales
```

---

## Sistema de diseño

### Paleta de colores
```css
--color-bg: #F5F0E8;          /* crema cálido — fondo principal */
--color-ink: #1A1410;         /* negro casi puro — texto */
--color-accent: #C8A96E;      /* dorado envejecido — acentos */
--color-muted: #8C7B6B;       /* marrón medio — texto secundario */
--color-surface: #EDE7DA;     /* superficie de tarjetas */
--color-border: #D4C9B8;      /* bordes sutiles */
```

### Tipografía
- **Display / títulos**: `Cormorant Garamond` — elegante, editorial, con historia
- **Body / UI**: `DM Sans` — limpio, funcional, moderno
- Importar desde Google Fonts en `app/layout.tsx`

### Tono visual
Editorial de moda de lujo con alma vintage. Fotografía con grain. Layouts asimétricos.
Mucho espacio negativo. Tipografía grande y dominante. Sin elementos genéricos de e-commerce.

---

## Modelo de datos (Supabase)

### Tabla: `products`
| campo | tipo | descripción |
|---|---|---|
| id | uuid | PK |
| slug | text | URL amigable |
| name | text | Nombre de la prenda |
| description | text | Historia / descripción editorial |
| price | numeric | Precio en COP |
| category | text | ropa, intimo-hogar, accesorios, especial |
| subcategory | text | ver estructura de categorías abajo |
| size | text | XS, S, M, L, XL, única |
| condition | text | excelente, buena, vintage |
| images | text[] | Array de URLs |
| in_stock | boolean | Solo 1 unidad por item |
| created_at | timestamp | |

### Estructura de categorías

La fuente de verdad es `lib/categories.ts`. Nunca hardcodear categorías en componentes.

| Categoría principal | Subcategorías |
|---|---|
| `ropa` | `vestidos`, `tops`, `pantalones-faldas`, `abrigos`, `conjuntos-especiales` |
| `intimo-hogar` | `lenceria`, `pijamas`, `ropa-de-bano`, `fajas` |
| `accesorios` | `bolsos-billeteras`, `zapatos`, `bufandas-correas`, `articulos-varios` |
| `especial` | `ninos`, `regaladas`, `ropa-de-verano` |

Migración SQL: `supabase/migrations/20260318_update_categories.sql`

### Tabla: `orders`
| campo | tipo | descripción |
|---|---|---|
| id | uuid | PK |
| customer_email | text | |
| items | jsonb | Array de productos |
| total | numeric | |
| status | text | pendiente, pagado, enviado |
| mercadopago_preference_id | text | ID de preferencia MP |
| mercadopago_payment_id | text | ID de pago confirmado |
| created_at | timestamp | |

---

## Páginas y secciones

### `/` — Home
1. **HeroSection** — Imagen editorial full-screen, headline grande, CTA
2. **FeaturedGrid** — 4–6 prendas destacadas en layout de revista
3. **PhilosophyTeaser** — Cita de marca + link a /nosotros
4. **InstagramFeed** — Grid visual de últimas piezas

### `/tienda` — Catálogo
- Filtros: categoría principal → subcategoría (jerárquico), talla, condición
- Soporta URL params `?cat=ropa&sub=vestidos` para pre-selección desde el Navbar
- Grid de productos (masonry o editorial asimétrico)
- Cada card muestra: foto, nombre, precio, talla

### `/tienda/[slug]` — Producto
- Galería de imágenes
- Nombre, precio, descripción editorial, condición, talla
- Botón "Agregar al carrito" (solo 1 unidad — marcar agotado si ya está en carrito)

### `/nosotros` — Filosofía
- Historia de la marca
- Valores: sostenibilidad, moda circular, identidad
- Foto / mood board editorial

### `/contacto` — Contacto
- Links a Instagram, WhatsApp, email
- Formulario simple

### `/carrito` — Carrito
- Lista de items, totales, botón checkout → MercadoPago (Checkout Pro)

---

## Convenciones de código

- Componentes en PascalCase, archivos en kebab-case
- `use client` solo cuando sea estrictamente necesario (interactividad)
- Imágenes con `next/image` siempre
- Tipos TypeScript en `/types/index.ts` — no `any`
- Commits en español, descriptivos
- Variables CSS para todos los colores — nunca hardcodear hex en components

---

## Comandos principales

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run lint      # ESLint
```

---

## Reglas para Claude Code

- **No refactorizar** código que no sea parte del task actual
- **No cambiar** el sistema de colores ni tipografía sin pedirlo explícitamente
- Siempre **una sola unidad por producto** — validar que `in_stock` se actualice al agregar al carrito
- El carrito vive en Zustand (cliente) y se sincroniza con MercadoPago al hacer checkout (Checkout Pro — redirige a MP)
- Antes de crear un componente nuevo, revisar si ya existe algo similar en `/components/`
- Priorizar **accesibilidad**: todos los botones con `aria-label`, imágenes con `alt` descriptivo
