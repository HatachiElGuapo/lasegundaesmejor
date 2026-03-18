/**
 * upload-to-supabase.mjs
 *
 * Lee las rutas de imágenes del CSV de catálogo, sube cada imagen al bucket
 * 'productos' de Supabase Storage y actualiza la columna 'imagen' con la
 * URL pública resultante. Guarda el CSV actualizado como catalogo-supabase.csv.
 *
 * Uso:
 *   node scripts/upload-to-supabase.mjs [csv-entrada] [csv-salida]
 *
 * Ejemplo:
 *   node scripts/upload-to-supabase.mjs catalogo-vision.csv catalogo-supabase.csv
 *
 * Variables de entorno requeridas (en .env.local o exportadas):
 *   NEXT_PUBLIC_SUPABASE_URL      — URL del proyecto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY     — Service role key (bypass RLS para uploads)
 *     ó NEXT_PUBLIC_SUPABASE_ANON_KEY  — si la política del bucket lo permite
 *
 * Las imágenes se leen desde: /tmp/prendas/Lasegunda/Lasegunda/
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Config ──────────────────────────────────────────────────────────────────

const IMAGES_BASE_DIR = '/tmp/prendas/Lasegunda/Lasegunda';
const BUCKET = 'productos';
const CONCURRENCY = 5;      // subidas en paralelo
const RETRY_ATTEMPTS = 3;   // reintentos por imagen fallida

// ─── Cargar .env.local si existe ─────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

// ─── Validar env vars ─────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Faltan variables de entorno:');
  console.error('    NEXT_PUBLIC_SUPABASE_URL');
  console.error('    SUPABASE_SERVICE_ROLE_KEY  (recomendado) o NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon';
console.log(`🔑  Usando clave: ${keyType}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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

function csvEscape(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCSV(content) {
  const lines = content.split('\n').filter((l) => l.trim() !== '');
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
  return { headers, rows };
}

function serializeCSV(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) =>
    headers.map((h) => csvEscape(row[h] ?? '')).join(',')
  );
  return [headerLine, ...dataLines].join('\n');
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function getMediaType(ext) {
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return map[ext.toLowerCase()] ?? 'image/jpeg';
}

/**
 * Normaliza el path de la imagen para usar como key en el bucket:
 * - Elimina carpetas duplicadas intermedias (ej: "Cat/Cat/file.png" → "Cat/file.png")
 * - Reemplaza caracteres problemáticos en nombres de carpeta
 */
function normalizeBucketPath(csvImagePath) {
  const parts = csvImagePath.split('/');
  // Eliminar segmentos duplicados consecutivos
  const deduped = parts.filter((part, idx) => idx === 0 || part !== parts[idx - 1]);
  return deduped.join('/');
}

/**
 * Sube una imagen al bucket con reintentos.
 * Devuelve la URL pública o lanza un error.
 */
async function uploadImage(localPath, bucketPath, attempt = 1) {
  const ext = path.extname(localPath);
  const contentType = getMediaType(ext);
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(bucketPath, fileBuffer, {
      contentType,
      upsert: true,        // sobreescribir si ya existe
    });

  if (error) {
    if (attempt < RETRY_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      return uploadImage(localPath, bucketPath, attempt + 1);
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(bucketPath);
  return data.publicUrl;
}

// ─── Procesamiento en paralelo ────────────────────────────────────────────────

async function pLimit(tasks, concurrency) {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const [, , inputCsv = 'catalogo-vision.csv', outputCsv = 'catalogo-supabase.csv'] = process.argv;

  const resolvedInput = path.resolve(inputCsv);
  if (!fs.existsSync(resolvedInput)) {
    console.error(`❌  CSV de entrada no encontrado: ${resolvedInput}`);
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_BASE_DIR)) {
    console.error(`❌  Directorio de imágenes no encontrado: ${IMAGES_BASE_DIR}`);
    process.exit(1);
  }

  console.log(`📄  CSV de entrada:  ${resolvedInput}`);
  console.log(`📂  Imágenes desde:  ${IMAGES_BASE_DIR}`);
  console.log(`🪣  Bucket:          ${BUCKET}\n`);

  const content = fs.readFileSync(resolvedInput, 'utf-8');
  const { headers, rows } = parseCSV(content);

  if (!headers.includes('imagen')) {
    console.error('❌  El CSV no tiene columna "imagen"');
    process.exit(1);
  }

  // Asegurar que existe la columna 'imagen_url' (o usar 'imagen' directamente)
  // Se actualiza la misma columna 'imagen' con la URL de Supabase
  const total = rows.length;
  let subidas = 0;
  let omitidas = 0;  // ya son URLs de Supabase
  let errores = 0;
  let idx = 0;

  const tasks = rows.map((row, rowIdx) => async () => {
    idx++;
    const csvImagePath = row['imagen']?.trim() ?? '';

    // Si ya es una URL de Supabase, saltar
    if (csvImagePath.startsWith('http')) {
      process.stdout.write(`  [${idx}/${total}] Ya es URL — omitiendo\n`);
      omitidas++;
      return;
    }

    if (!csvImagePath) {
      process.stdout.write(`  [${idx}/${total}] ⚠️  Sin ruta de imagen — omitiendo\n`);
      errores++;
      return;
    }

    const localPath = path.join(IMAGES_BASE_DIR, csvImagePath);
    const bucketPath = normalizeBucketPath(csvImagePath);
    const filename = path.basename(csvImagePath);

    process.stdout.write(`  [${idx}/${total}] ${filename} ... `);

    if (!fs.existsSync(localPath)) {
      process.stdout.write(`❌  No encontrada: ${localPath}\n`);
      errores++;
      return;
    }

    try {
      const publicUrl = await uploadImage(localPath, bucketPath);
      rows[rowIdx]['imagen'] = publicUrl;
      process.stdout.write(`✅\n`);
      subidas++;
    } catch (err) {
      process.stdout.write(`❌  ${err.message}\n`);
      errores++;
    }
  });

  await pLimit(tasks, CONCURRENCY);

  // Guardar CSV actualizado
  const resolvedOutput = path.resolve(outputCsv);
  const updatedCsv = serializeCSV(headers, rows);
  fs.writeFileSync(resolvedOutput, updatedCsv, 'utf-8');

  console.log('\n─────────────────────────────────────');
  console.log(`✅  Subidas:  ${subidas}`);
  console.log(`⏭️   Omitidas: ${omitidas} (ya eran URLs)`);
  console.log(`❌  Errores:  ${errores}`);
  console.log(`📄  CSV guardado: ${resolvedOutput}`);
}

main().catch((err) => {
  console.error('❌  Error inesperado:', err.message);
  process.exit(1);
});
