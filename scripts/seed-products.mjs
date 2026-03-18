/**
 * seed-products.mjs
 *
 * Lee catalogo-supabase.csv e inserta cada fila en la tabla `products`
 * de Supabase. Usa upsert por slug para que sea seguro re-ejecutar.
 *
 * Uso:
 *   node scripts/seed-products.mjs [archivo.csv]
 *
 * Ejemplo:
 *   node scripts/seed-products.mjs catalogo-supabase.csv
 *
 * Credenciales desde .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (recomendado) o NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Cargar .env.local ────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

// ─── Validar credenciales ─────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Faltan variables de entorno en .env.local:');
  console.error('    NEXT_PUBLIC_SUPABASE_URL');
  console.error('    SUPABASE_SERVICE_ROLE_KEY  (o NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon';
console.log(`🔑  Clave: ${keyType}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(content) {
  const lines = content.split('\n').filter((l) => l.trim() !== '');
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (values[i] ?? '').trim()]));
  });
}

// ─── Transformadores de datos ─────────────────────────────────────────────────

// Elimina símbolo de moneda y convierte formato colombiano ($29.999 → 29999)
function parsePrice(raw) {
  if (!raw) return null;
  const cleaned = raw
    .replace(/[$\s]/g, '')   // quitar $ y espacios
    .replace(/\./g, '')      // quitar puntos de miles (formato COP: 29.999)
    .replace(/,/g, '.')      // coma decimal → punto
    .replace(/k$/i, '000');  // 25k → 25000
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

const VALID_CATEGORIES = new Set(['tops', 'bottoms', 'outerwear', 'accesorios']);
const CATEGORY_MAP = {
  vestidos: 'tops',
  blusas: 'tops',
  camisas: 'tops',
  'camisas leñadoras': 'tops',
  'ropa de baño': 'accesorios',
  lenceria: 'accesorios',
  lencería: 'accesorios',
  bolsos: 'accesorios',
  zapatos: 'accesorios',
  calzado: 'accesorios',
  niños: 'tops',
  'artículos varios': 'accesorios',
  otro: 'accesorios',
};

function parseCategory(raw) {
  if (!raw) return 'accesorios';
  const lower = raw.toLowerCase().trim();
  if (VALID_CATEGORIES.has(lower)) return lower;
  return CATEGORY_MAP[lower] ?? 'accesorios';
}

const VALID_SIZES = new Set(['XS', 'S', 'M', 'L', 'XL', 'única']);
const SIZE_MAP = {
  'unica': 'única',
  'unique': 'única',
  'one size': 'única',
  'talla única': 'única',
  'xs': 'XS',
  's': 'S',
  'm': 'M',
  'l': 'L',
  'xl': 'XL',
};

function parseSize(raw) {
  if (!raw) return 'única';
  const trimmed = raw.trim();
  if (VALID_SIZES.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  return SIZE_MAP[lower] ?? 'única';
}

const VALID_CONDITIONS = new Set(['excelente', 'buena', 'vintage']);

function parseCondition(raw) {
  if (!raw) return 'buena';
  const lower = raw.toLowerCase().trim();
  return VALID_CONDITIONS.has(lower) ? lower : 'buena';
}

// Slug único: agrega sufijo numérico si ya existe en este lote
function ensureUniqueSlug(slug, seen) {
  if (!seen.has(slug)) { seen.add(slug); return slug; }
  let i = 2;
  while (seen.has(`${slug}-${i}`)) i++;
  const unique = `${slug}-${i}`;
  seen.add(unique);
  return unique;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const BATCH_SIZE = 50; // filas por upsert

async function main() {
  const [, , inputCsv = 'catalogo-supabase.csv'] = process.argv;
  const resolvedInput = path.resolve(inputCsv);

  if (!fs.existsSync(resolvedInput)) {
    console.error(`❌  Archivo no encontrado: ${resolvedInput}`);
    process.exit(1);
  }

  console.log(`📄  Leyendo: ${resolvedInput}\n`);

  const rows = parseCSV(fs.readFileSync(resolvedInput, 'utf-8'));
  console.log(`📦  ${rows.length} filas en el CSV\n`);

  // Transformar filas al esquema de la tabla products
  const slugsSeen = new Set();
  const products = [];
  const skipped = [];

  for (const row of rows) {
    const imagen = row['imagen']?.trim();

    // Omitir filas sin URL de imagen (no se subieron correctamente)
    if (!imagen || !imagen.startsWith('http')) {
      skipped.push({ row, reason: 'sin URL de imagen' });
      continue;
    }

    const rawSlug = row['slug']?.trim() || '';
    const slug = ensureUniqueSlug(rawSlug || 'producto', slugsSeen);
    const nombre = row['nombre']?.trim() || '';
    const precio = parsePrice(row['precio']);

    if (!precio) {
      skipped.push({ row, reason: 'precio inválido o vacío' });
      continue;
    }

    products.push({
      slug,
      name: nombre,
      description: nombre,          // mismo texto — editarlo luego en el CMS
      price: precio,
      category: parseCategory(row['categoria']),
      size: parseSize(row['talla']),
      condition: parseCondition(row['condicion']),
      images: [imagen],             // array — un solo elemento por prenda
      in_stock: true,
    });
  }

  console.log(`✅  ${products.length} productos listos para insertar`);
  if (skipped.length > 0) {
    console.log(`⚠️   ${skipped.length} filas omitidas:`);
    const grouped = {};
    for (const s of skipped) {
      grouped[s.reason] = (grouped[s.reason] ?? 0) + 1;
    }
    for (const [reason, count] of Object.entries(grouped)) {
      console.log(`    • ${reason}: ${count}`);
    }
  }

  if (products.length === 0) {
    console.log('\n⚠️  Nada que insertar.');
    return;
  }

  console.log(`\n🚀  Insertando en lotes de ${BATCH_SIZE}...\n`);

  let insertados = 0;
  let errores = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(products.length / BATCH_SIZE);

    process.stdout.write(`  Lote ${batchNum}/${totalBatches} (${batch.length} filas) ... `);

    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'slug' });   // actualiza si el slug ya existe

    if (error) {
      process.stdout.write(`❌  ${error.message}\n`);
      errores += batch.length;
    } else {
      process.stdout.write(`✅\n`);
      insertados += batch.length;
    }
  }

  console.log('\n─────────────────────────────────────');
  console.log(`✅  Insertados/actualizados: ${insertados}`);
  console.log(`❌  Errores:                 ${errores}`);
  console.log(`⏭️   Omitidos del CSV:        ${skipped.length}`);
}

main().catch((err) => {
  console.error('❌  Error inesperado:', err.message);
  process.exit(1);
});
