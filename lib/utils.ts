/**
 * Formatea un precio en MXN.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normaliza un término de búsqueda: minúsculas, sin espacios ni guiones.
 * Permite que "cd001", "CD-001" y "cd 001" encuentren "ACC-001".
 */
export function normalizeSearch(s: string): string {
  return s.toLowerCase().replace(/[\s\-]/g, "");
}

/**
 * Combina clases CSS condicionalmente (reemplaza cn de shadcn sin dependencia extra).
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
