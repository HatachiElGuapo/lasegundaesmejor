/**
 * vision-catalog.mjs
 *
 * Lee imágenes de prendas usando la API de Anthropic con visión y extrae
 * automáticamente: nombre/descripción, precio, talla y código de referencia
 * escritos en la foto. Genera un CSV listo para importar.
 *
 * Uso:
 *   ANTHROPIC_API_KEY=sk-... node scripts/vision-catalog.mjs <carpeta-imágenes> [salida.csv] [--only <csv-pendientes>]
 *
 * Ejemplos:
 *   node scripts/vision-catalog.mjs /tmp/prendas/Lasegunda/ catalogo-vision.csv
 *   node scripts/vision-catalog.mjs /tmp/prendas/Lasegunda/ catalogo-vision.csv --only pendientes_reprocesar.csv
 *
 * Con --only solo se procesan las imágenes listadas en la columna "imagen" del CSV indicado.
 *
 * Requiere:
 *   npm install @anthropic-ai/sdk
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const MODEL = 'claude-opus-4-6';
const MAX_TOKENS = 1024;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Cuántas imágenes procesar en paralelo (evitar rate limits)
const CONCURRENCY = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function getMediaType(ext) {
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return map[ext] ?? 'image/jpeg';
}

function toSlug(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/**
 * Parsea los argumentos de proceso.argv ignorando node y el script.
 * Devuelve { positional: string[], flags: Map<string, string> }
 */
function parseArgs(argv) {
  const positional = [];
  const flags = new Map();
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i];
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : '';
      flags.set(key, value);
    } else {
      positional.push(args[i]);
    }
  }
  return { positional, flags };
}

/**
 * Lee un CSV y devuelve los valores únicos de la columna "imagen".
 * Soporta delimitador coma y punto y coma, y valores entre comillas.
 */
function readOnlyList(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  // Detectar delimitador
  const delimiter = lines[0].includes(';') ? ';' : ',';

  // Parsear cabecera
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const col = headers.indexOf('imagen');
  if (col === -1) {
    console.error(`❌  El CSV "${csvPath}" no tiene columna "imagen".`);
    process.exit(1);
  }

  const values = new Set();
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const cells = line.split(delimiter);
    const cell = (cells[col] ?? '').trim().replace(/^"|"$/g, '');
    if (cell) values.add(cell);
  }
  return [...values];
}

/** Colecta todos los archivos de imagen en el directorio (recursivo). */
function collectImages(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

/** Ejecuta tareas en lotes de tamaño `concurrency`. */
async function pLimit(tasks, concurrency) {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

// ─── Extracción con visión ────────────────────────────────────────────────────

const client = new Anthropic();

const SYSTEM_PROMPT = `Eres un asistente experto en catálogos de ropa de segunda mano.
Tu tarea es analizar imágenes de prendas y extraer exactamente los datos que aparecen escritos en la foto.
Responde SIEMPRE en JSON válido con esta estructura exacta, sin texto adicional:
{
  "nombre": "nombre o descripción de la prenda visible en la imagen",
  "precio": "precio tal como aparece en la foto (ej: 25000, $25.000, 25k) o null si no hay",
  "talla": "talla tal como aparece (ej: S, M, L, XL, 38, única) o null si no hay",
  "referencia": "código o número de referencia visible en la foto o null si no hay",
  "categoria": "una de: tops, bottoms, outerwear, accesorios, vestidos, calzado, otro",
  "condicion": "una de: excelente, buena, vintage, o null si no es visible"
}

Si un campo no está visible en la imagen, usa null.
El nombre debe describir la prenda visible aunque no esté escrito explícitamente.`;

async function extractFromImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const mediaType = getMediaType(ext);
  const imageData = fs.readFileSync(imagePath).toString('base64');
  const filename = path.basename(imagePath);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: imageData },
            },
            {
              type: 'text',
              text: `Analiza esta imagen de prenda (archivo: ${filename}) y extrae los datos indicados en formato JSON.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) throw new Error('Sin respuesta de texto');

    // Limpiar posibles bloques de código markdown
    const raw = textBlock.text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(raw);
    return { ok: true, data: parsed };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const { positional, flags } = parseArgs(process.argv);
  const [inputDir, outputFile = 'catalogo-vision.csv'] = positional;
  const onlyCsv = flags.get('--only') ?? null;

  if (!inputDir) {
    console.error('❌  Uso: node scripts/vision-catalog.mjs <carpeta-imágenes> [salida.csv] [--only <csv-pendientes>]');
    console.error('    Ejemplo: node scripts/vision-catalog.mjs /tmp/prendas/Lasegunda/ catalogo-vision.csv --only pendientes_reprocesar.csv');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌  Falta la variable de entorno ANTHROPIC_API_KEY');
    process.exit(1);
  }

  const resolvedDir = path.resolve(inputDir);
  if (!fs.existsSync(resolvedDir)) {
    console.error(`❌  La carpeta "${resolvedDir}" no existe.`);
    process.exit(1);
  }

  let images;

  if (onlyCsv) {
    const resolvedCsv = path.resolve(onlyCsv);
    if (!fs.existsSync(resolvedCsv)) {
      console.error(`❌  El CSV "${resolvedCsv}" no existe.`);
      process.exit(1);
    }
    const relPaths = readOnlyList(resolvedCsv);
    if (relPaths.length === 0) {
      console.warn('⚠️   El CSV de pendientes no contiene filas con columna "imagen".');
      process.exit(0);
    }
    images = relPaths.map((rel) => path.join(resolvedDir, rel));
    const missing = images.filter((p) => !fs.existsSync(p));
    if (missing.length > 0) {
      console.warn(`⚠️   ${missing.length} imagen(es) del CSV no encontradas en la carpeta:`);
      missing.forEach((p) => console.warn(`     • ${p}`));
    }
    images = images.filter((p) => fs.existsSync(p));
    console.log(`📂  Carpeta base: ${resolvedDir}`);
    console.log(`📋  Modo --only: usando "${resolvedCsv}" (${relPaths.length} entradas, ${images.length} encontradas)`);
  } else {
    console.log(`📂  Leyendo imágenes desde: ${resolvedDir}`);
    images = collectImages(resolvedDir);
  }

  if (images.length === 0) {
    console.warn('⚠️   No se encontraron imágenes. Extensiones soportadas: .jpg .jpeg .png .webp');
    process.exit(0);
  }

  console.log(`🖼️   ${images.length} imagen(es) encontrada(s). Procesando con visión...`);
  console.log(`     Modelo: ${MODEL} | Concurrencia: ${CONCURRENCY}\n`);

  const rows = [];
  let ok = 0;
  let errores = 0;
  let idx = 0;

  const tasks = images.map((imgPath) => async () => {
    idx++;
    const filename = path.basename(imgPath);
    process.stdout.write(`  [${idx}/${images.length}] ${filename} ... `);

    const result = await extractFromImage(imgPath);

    if (result.ok) {
      const d = result.data;
      const slug = toSlug(d.nombre || filename);
      const relPath = path.relative(resolvedDir, imgPath).replace(/\\/g, '/');

      rows.push({
        slug,
        nombre: d.nombre ?? '',
        precio: d.precio ?? '',
        talla: d.talla ?? '',
        referencia: d.referencia ?? '',
        categoria: d.categoria ?? '',
        condicion: d.condicion ?? '',
        imagen: relPath,
      });
      process.stdout.write(`✅  ${d.nombre || '(sin nombre)'}\n`);
      ok++;
    } else {
      process.stdout.write(`❌  Error: ${result.error}\n`);
      // Fila de error para no perder la imagen
      rows.push({
        slug: toSlug(filename),
        nombre: '',
        precio: '',
        talla: '',
        referencia: '',
        categoria: '',
        condicion: '',
        imagen: path.relative(resolvedDir, imgPath).replace(/\\/g, '/'),
      });
      errores++;
    }
  });

  await pLimit(tasks, CONCURRENCY);

  // Ordenar por imagen para mantener el orden del directorio
  rows.sort((a, b) => a.imagen.localeCompare(b.imagen));

  // Construir CSV
  const COLUMNS = ['slug', 'nombre', 'precio', 'talla', 'referencia', 'categoria', 'condicion', 'imagen'];
  const header = COLUMNS.join(',');
  const csvRows = rows.map((r) => csvRow(COLUMNS.map((col) => r[col])));
  const csv = [header, ...csvRows].join('\n');

  const resolvedOutput = path.resolve(outputFile);
  fs.writeFileSync(resolvedOutput, csv, 'utf-8');

  console.log(`\n✅  CSV generado: ${resolvedOutput}`);
  console.log(`    ${ok} procesada(s) con éxito | ${errores} con error | ${rows.length} filas en total`);
}

main().catch((err) => {
  console.error('❌  Error inesperado:', err.message);
  process.exit(1);
});
