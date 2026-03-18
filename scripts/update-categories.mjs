/**
 * update-categories.mjs
 *
 * Actualiza category y subcategory en Supabase para cada producto,
 * derivando la categoría a partir de la carpeta que aparece en la columna images.
 *
 * Uso:
 *   node scripts/update-categories.mjs [--dry-run]
 *
 * Con --dry-run imprime los cambios sin aplicarlos.
 *
 * Requiere las variables de entorno (cargadas desde .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Cargar .env.local ────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

// ─── Mapeo carpeta → { category, subcategory } ────────────────────────────────

const FOLDER_MAP = {
  'Gótico':                        { category: 'ropa',         subcategory: 'conjuntos-especiales' },
  'Gotico':                        { category: 'ropa',         subcategory: 'conjuntos-especiales' },
  'Faldas':                        { category: 'ropa',         subcategory: 'pantalones-faldas' },
  'Blusones dama':                 { category: 'ropa',         subcategory: 'tops' },
  'Bodys':                         { category: 'ropa',         subcategory: 'tops' },
  'Busos-sueter dama':             { category: 'ropa',         subcategory: 'abrigos' },
  'Camisetas dama':                { category: 'ropa',         subcategory: 'tops' },
  'Bufandas':                      { category: 'accesorios',   subcategory: 'bufandas-correas' },
  'Kimonos-sobrepuestos':          { category: 'ropa',         subcategory: 'conjuntos-especiales' },
  'Asiatico':                      { category: 'ropa',         subcategory: 'conjuntos-especiales' },
  'Asiático':                      { category: 'ropa',         subcategory: 'conjuntos-especiales' },
  'Lenceria':                      { category: 'intimo-hogar', subcategory: 'lenceria' },
  'Lencería':                      { category: 'intimo-hogar', subcategory: 'lenceria' },
  'Niños':                         { category: 'especial',     subcategory: 'ninos' },
  'Ninos':                         { category: 'especial',     subcategory: 'ninos' },
  'Billeteras correas y accesorios': { category: 'accesorios', subcategory: 'bufandas-correas' },
  'Artículos varios':              { category: 'accesorios',   subcategory: 'articulos-varios' },
  'Articulos varios':              { category: 'accesorios',   subcategory: 'articulos-varios' },
  'Pantalones dama':               { category: 'ropa',         subcategory: 'pantalones-faldas' },
  'Chalecos dama':                 { category: 'ropa',         subcategory: 'abrigos' },
  'Fajas':                         { category: 'intimo-hogar', subcategory: 'fajas' },
  'Zapatos':                       { category: 'accesorios',   subcategory: 'zapatos' },
  'Chaquetas':                     { category: 'ropa',         subcategory: 'abrigos' },
  'Pijamas':                       { category: 'intimo-hogar', subcategory: 'pijamas' },
  'Camisas leñadoras':             { category: 'ropa',         subcategory: 'tops' },
  'Camisas lenadoras':             { category: 'ropa',         subcategory: 'tops' },
  'Regaladas':                     { category: 'especial',     subcategory: 'regaladas' },
  'Vestidos de fiesta':            { category: 'ropa',         subcategory: 'vestidos' },
  'Deportiva':                     { category: 'ropa',         subcategory: 'conjuntos-especiales' },
  'Jeans':                         { category: 'ropa',         subcategory: 'pantalones-faldas' },
  'Short':                         { category: 'ropa',         subcategory: 'pantalones-faldas' },
  'Ropa de verano':                { category: 'especial',     subcategory: 'ropa-de-verano' },
  'Ropa de baño':                  { category: 'intimo-hogar', subcategory: 'ropa-de-bano' },
  'Ropa de bano':                  { category: 'intimo-hogar', subcategory: 'ropa-de-bano' },
  'Bolsos':                        { category: 'accesorios',   subcategory: 'bolsos-billeteras' },
  'Bolsos(1)':                     { category: 'accesorios',   subcategory: 'bolsos-billeteras' },
  'Jeans(1)':                      { category: 'ropa',         subcategory: 'pantalones-faldas' },
  'Ropa de baño(1)':               { category: 'intimo-hogar', subcategory: 'ropa-de-bano' },
  'Busos -sueter dama':            { category: 'ropa',         subcategory: 'abrigos' },
  'Blusas':                        { category: 'ropa',         subcategory: 'tops' },
  'Blusas promocion':              { category: 'ropa',         subcategory: 'tops' },
  'Blusas promoción':              { category: 'ropa',         subcategory: 'tops' },
  'Abrigos-gabardinas dama':       { category: 'ropa',         subcategory: 'abrigos' },
  'Vestidos':                      { category: 'ropa',         subcategory: 'vestidos' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrae el nombre de la carpeta desde una URL de Supabase Storage.
 * Formato típico: .../storage/v1/object/public/<bucket>/<carpeta>/archivo.jpg
 * También soporta rutas relativas: <carpeta>/archivo.jpg
 */
function folderFromImage(imageValue) {
  if (!imageValue) return null;

  // Si es array JSON o string de array
  let url = imageValue;
  if (Array.isArray(imageValue)) {
    url = imageValue[0];
  } else if (typeof imageValue === 'string' && imageValue.startsWith('[')) {
    try {
      const arr = JSON.parse(imageValue);
      url = Array.isArray(arr) ? arr[0] : imageValue;
    } catch {
      // no era JSON, usar como está
    }
  }

  if (!url) return null;

  // URL completa de Supabase Storage: extraer segmento de carpeta
  // Buscar el patrón /public/<bucket>/<carpeta>/
  const publicMatch = url.match(/\/public\/[^/]+\/(.+?)\/[^/]+$/);
  if (publicMatch) {
    // Puede ser una ruta anidada; devolver el primer segmento de carpeta
    return decodeURIComponent(publicMatch[1].split('/')[0]);
  }

  // Ruta relativa tipo "Carpeta/archivo.jpg"
  const parts = url.replace(/\\/g, '/').split('/');
  if (parts.length >= 2) {
    return decodeURIComponent(parts[0]);
  }

  return null;
}

function resolveMapping(folder) {
  if (!folder) return null;
  // Búsqueda exacta
  if (FOLDER_MAP[folder]) return FOLDER_MAP[folder];
  // Búsqueda case-insensitive como fallback
  const lower = folder.toLowerCase();
  const key = Object.keys(FOLDER_MAP).find((k) => k.toLowerCase() === lower);
  return key ? FOLDER_MAP[key] : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌  Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  if (dryRun) console.log('🔍  Modo --dry-run: no se aplicarán cambios en Supabase.\n');

  // Traer todos los productos (paginado de a 1000)
  console.log('⬇️   Descargando productos desde Supabase...');
  let products = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, images, category, subcategory')
      .range(from, from + PAGE - 1);

    if (error) {
      console.error('❌  Error al consultar Supabase:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) break;
    products.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  console.log(`    ${products.length} producto(s) encontrado(s).\n`);

  // Estadísticas
  let updated = 0;
  let skipped = 0;
  let unmapped = 0;
  const unmappedFolders = new Set();

  for (const product of products) {
    const folder = folderFromImage(product.images);
    const mapping = resolveMapping(folder);

    if (!mapping) {
      unmapped++;
      if (folder) unmappedFolders.add(folder);
      const label = folder ?? '(sin imagen)';
      console.log(`⚠️   ${product.slug ?? product.id} — carpeta sin mapeo: "${label}"`);
      continue;
    }

    const sameCategory    = product.category    === mapping.category;
    const sameSubcategory = product.subcategory === mapping.subcategory;

    if (sameCategory && sameSubcategory) {
      skipped++;
      continue;
    }

    const before = `${product.category ?? '—'} / ${product.subcategory ?? '—'}`;
    const after  = `${mapping.category} / ${mapping.subcategory}`;
    console.log(`${dryRun ? '🔵' : '✅'}  ${product.slug ?? product.id}  [${before}] → [${after}]`);

    if (!dryRun) {
      const { error } = await supabase
        .from('products')
        .update({ category: mapping.category, subcategory: mapping.subcategory })
        .eq('id', product.id);

      if (error) {
        console.error(`   ❌  Error al actualizar ${product.id}: ${error.message}`);
        continue;
      }
    }

    updated++;
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`${dryRun ? '🔵  Cambios que se aplicarían' : '✅  Actualizados'}: ${updated}`);
  console.log(`⏭️   Sin cambios (ya correctos):          ${skipped}`);
  console.log(`⚠️   Sin mapeo de carpeta:                ${unmapped}`);

  if (unmappedFolders.size > 0) {
    console.log('\n📋  Carpetas sin mapeo encontradas:');
    for (const f of [...unmappedFolders].sort()) {
      console.log(`     • "${f}"`);
    }
  }
}

main().catch((err) => {
  console.error('❌  Error inesperado:', err.message);
  process.exit(1);
});
