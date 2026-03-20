/**
 * Backfill de referencias para productos existentes sin referencia.
 *
 * Uso:
 *   node --env-file=.env.local scripts/backfill-references.mjs
 *
 * Necesita NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
 * (o SUPABASE_SERVICE_ROLE_KEY si RLS bloquea updates sin auth).
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltan variables de entorno. Revisa .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const PREFIX = {
  ropa:          "ROP",
  "intimo-hogar": "INT",
  accesorios:    "ACC",
  especial:      "ESP",
};

function pad(n) {
  return String(n).padStart(3, "0");
}

async function main() {
  // Traer solo los que no tienen referencia, ordenados por fecha de creación
  const { data: products, error } = await supabase
    .from("products")
    .select("id, category, reference, created_at")
    .is("reference", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error al leer productos:", error.message);
    process.exit(1);
  }

  if (!products.length) {
    console.log("Todos los productos ya tienen referencia. Nada que hacer.");
    return;
  }

  console.log(`Procesando ${products.length} producto(s) sin referencia...\n`);

  // Contadores por prefijo para este backfill.
  // Primero obtenemos el máximo secuencial ya existente por categoría.
  const { data: existing } = await supabase
    .from("products")
    .select("reference")
    .not("reference", "is", null);

  const counters = { ROP: 0, INT: 0, ACC: 0, ESP: 0 };

  for (const { reference } of existing ?? []) {
    const match = reference.match(/^([A-Z]+)-(\d+)$/);
    if (match) {
      const [, pre, num] = match;
      if (pre in counters) counters[pre] = Math.max(counters[pre], parseInt(num, 10));
    }
  }

  const updates = [];

  for (const product of products) {
    const prefix = PREFIX[product.category] ?? product.category.slice(0, 3).toUpperCase();
    if (!(prefix in counters)) counters[prefix] = 0;
    counters[prefix] += 1;
    const reference = `${prefix}-${pad(counters[prefix])}`;
    updates.push({ id: product.id, reference });
    console.log(`  ${product.id}  →  ${reference}  (${product.category})`);
  }

  // Actualizar en lotes de 50
  const BATCH = 50;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    for (const { id, reference } of batch) {
      const { error: upErr } = await supabase
        .from("products")
        .update({ reference })
        .eq("id", id);
      if (upErr) console.error(`  ERROR en ${id}: ${upErr.message}`);
    }
  }

  console.log(`\nListo. ${updates.length} referencia(s) asignada(s).`);
}

main();
