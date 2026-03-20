import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toggleProductStock } from "./actions";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Productos — Admin" };

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim() ?? "";
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select("id, name, price, category, size, in_stock, images, reference, created_at")
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: products } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="px-5 py-2.5 bg-ink text-bg text-sm tracking-widest uppercase hover:bg-accent transition-colors rounded"
        >
          + Nuevo
        </Link>
      </div>

      {/* Buscador */}
      <form method="GET" className="flex items-center gap-3 mb-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="flex-1 px-4 py-2 bg-surface border border-border rounded text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-ink text-bg text-sm tracking-widest uppercase hover:bg-accent transition-colors rounded"
        >
          Buscar
        </button>
        {q && (
          <Link
            href="/admin/productos"
            className="px-4 py-2 border border-border rounded text-sm text-muted hover:text-ink hover:border-ink transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      {q && (
        <p className="text-sm text-muted mb-4">
          {products?.length ?? 0} resultado{products?.length !== 1 ? "s" : ""} para{" "}
          <span className="text-ink font-medium">"{q}"</span>
        </p>
      )}

      {!products?.length ? (
        <div className="bg-surface border border-border rounded p-10 text-center">
          <p className="text-muted">No hay productos aún.</p>
          <Link href="/admin/productos/nuevo" className="text-sm text-accent mt-2 inline-block">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-widest">
                <th className="px-5 py-4">Prenda</th>
                <th className="px-5 py-4">Ref.</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Cat.</th>
                <th className="px-5 py-4">Talla</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-bg/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 border border-border">
                          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                        </div>
                      )}
                      <span className="text-ink font-medium line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-muted tracking-wider">
                      {p.reference ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink">
                    ${p.price.toLocaleString("es-CO")}
                  </td>
                  <td className="px-5 py-3 text-muted capitalize">{p.category}</td>
                  <td className="px-5 py-3 text-muted">{p.size}</td>
                  <td className="px-5 py-3">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProductStock(p.id, !p.in_stock);
                      }}
                    >
                      <button
                        type="submit"
                        className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                          p.in_stock
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } transition-colors`}
                      >
                        {p.in_stock ? "En stock" : "Vendido"}
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/productos/${p.id}/editar`}
                        className="text-accent hover:underline text-xs"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton productId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
