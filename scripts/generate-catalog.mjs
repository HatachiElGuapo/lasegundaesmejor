/**
 * generate-catalog.mjs
 *
 * Lee una carpeta de imágenes organizada por subcarpetas de categoría
 * y genera un archivo CSV listo para completar manualmente.
 *
 * Uso:
 *   node scripts/generate-catalog.mjs <carpeta-imágenes> [archivo-salida.csv]
 *
 * Estructura esperada de carpetas:
 *   imágenes/
 *   ├── tops/
 *   │   ├── Camisa de Lino Blanca.jpg
 *   │   └── Top Canalé Negro.png
 *   ├── bottoms/
 *   │   └── Falda Midi Plisada.jpg
 *   └── outerwear/
 *       └── Abrigo de Lana Gris.jpg
 *
 * Si una imagen está en la raíz (sin subcarpeta), la categoría queda vacía.
 */

import fs   from 'fs';
import path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

const VALID_CATEGORIES = new Set(['tops', 'bottoms', 'outerwear', 'accesorios']);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convierte un nombre de archivo en slug URL-amigable.
 * "Camisa de Lino Blanca.jpg" → "camisa-de-lino-blanca"
 * "Blazer Camel Vintage_2.jpg" → "blazer-camel-vintage"  (elimina sufijo numérico)
 */
function toSlug(filename) {
  return filename
    .normalize('NFD')                      // descomponer acentos
    .replace(/[\u0300-\u036f]/g, '')       // eliminar diacríticos
    .toLowerCase()
    .replace(/[_\s]+\d+$/, '')             // eliminar sufijo numérico: _2, _3, " 2"…
    .replace(/[^a-z0-9\s-]/g, '')          // solo letras, números, espacios, guiones
    .trim()
    .replace(/\s+/g, '-')                  // espacios → guiones
    .replace(/-+/g, '-');                  // guiones múltiples → uno solo
}

/**
 * Convierte el nombre de archivo en nombre legible.
 * "camisa_de_lino_blanca.jpg" → "Camisa De Lino Blanca"
 * "Camisa de Lino Blanca.jpg" → "Camisa de Lino Blanca"  (respeta mayúsculas originales)
 */
function toName(filename) {
  return filename
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Escapa un valor para CSV (comillas si contiene coma, comilla o salto de línea).
 */
function csvEscape(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(values) {
  return values.map(csvEscape).join(',');
}

// ─── Lectura recursiva de imágenes ───────────────────────────────────────────

function collectImages(dir, rootDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath, rootDir));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    // Carpeta padre relativa a rootDir
    const relativeDir  = path.relative(rootDir, dir);
    const parentFolder = relativeDir === '' ? '' : relativeDir.split(path.sep)[0];

    // Categoría: nombre real de la carpeta padre (se puede remap manual después)
    const category = parentFolder;

    const nameWithoutExt = path.basename(entry.name, ext);
    const slug  = toSlug(nameWithoutExt);
    const name  = toName(nameWithoutExt);

    // Ruta relativa de la imagen desde rootDir (para usar como URL o referencia)
    const imagePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    results.push({ slug, name, category, imagePath });
  }

  return results;
}

// ─── Agrupación por slug (un producto puede tener varias imágenes) ─────────

function groupBySlug(images) {
  const map = new Map();

  for (const img of images) {
    if (!map.has(img.slug)) {
      map.set(img.slug, {
        slug:      img.slug,
        name:      img.name,
        category:  img.category,
        images:    [],
      });
    }
    map.get(img.slug).images.push(img.imagePath);
  }

  return [...map.values()];
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const [,, inputDir, outputFile = 'catalogo.csv'] = process.argv;

  if (!inputDir) {
    console.error('❌  Uso: node scripts/generate-catalog.mjs <carpeta-imágenes> [salida.csv]');
    process.exit(1);
  }

  const resolvedDir = path.resolve(inputDir);

  if (!fs.existsSync(resolvedDir)) {
    console.error(`❌  La carpeta "${resolvedDir}" no existe.`);
    process.exit(1);
  }

  console.log(`📂  Leyendo imágenes desde: ${resolvedDir}`);

  const rawImages = collectImages(resolvedDir, resolvedDir);

  if (rawImages.length === 0) {
    console.warn('⚠️   No se encontraron imágenes. Verifica la carpeta y las extensiones soportadas.');
    console.warn(`    Extensiones soportadas: ${[...IMAGE_EXTENSIONS].join(', ')}`);
    process.exit(0);
  }

  const products = groupBySlug(rawImages);

  // Construir CSV
  const COLUMNS = ['slug', 'name', 'price', 'category', 'size', 'condition', 'images'];
  const header  = COLUMNS.join(',');

  const rows = products.map((p) =>
    csvRow([
      p.slug,
      p.name,
      '',                        // price — completar manualmente
      p.category,
      '',                        // size — completar manualmente
      '',                        // condition — completar manualmente
      p.images.join(' | '),      // múltiples imágenes separadas por " | "
    ])
  );

  const csv = [header, ...rows].join('\n');

  const resolvedOutput = path.resolve(outputFile);
  fs.writeFileSync(resolvedOutput, csv, 'utf-8');

  console.log(`✅  CSV generado: ${resolvedOutput}`);
  console.log(`    ${products.length} producto(s) — ${rawImages.length} imagen(es) encontrada(s)`);

  // Advertencias
  const sinCategoria = products.filter((p) => !p.category);
  if (sinCategoria.length > 0) {
    console.warn(`\n⚠️   ${sinCategoria.length} producto(s) sin categoría reconocida:`);
    sinCategoria.forEach((p) => console.warn(`    - ${p.name} (slug: ${p.slug})`));
    console.warn(`    Categorías válidas: ${[...VALID_CATEGORIES].join(', ')}`);
  }

  const slugsDuplicados = rawImages
    .map((i) => i.slug)
    .filter((slug, idx, arr) => arr.indexOf(slug) !== idx);
  if (slugsDuplicados.length > 0) {
    const uniq = [...new Set(slugsDuplicados)];
    console.warn(`\n⚠️   Slugs con múltiples imágenes (agrupados en una fila):`);
    uniq.forEach((s) => console.warn(`    - ${s}`));
  }
}

main();
