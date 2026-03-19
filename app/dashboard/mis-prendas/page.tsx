import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { deleteUserProduct } from "./actions";

export const metadata = { title: "Mis prendas — Dashboard" };

export default async function MisPrendasPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, size, in_stock, images, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Mis prendas</h1>
        <Link
          href="/dashboard/mis-prendas/nueva"
          className="px-5 py-2.5 bg-ink text-bg text-sm tracking-widest uppercase hover:bg-accent transition-colors rounded"
        >
          + Subir prenda
        </Link>
      </div>

      {!products?.length ? (
        <div className="bg-surface border border-border rounded p-10 text-center">
          <p className="text-muted mb-3">Aún no has subido prendas.</p>
          <Link
            href="/dashboard/mis-prendas/nueva"
            className="text-sm text-accent hover:underline"
          >
            Subir mi primera prenda →
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-widest">
                <th className="px-5 py-4">Prenda</th>
                <th className="px-5 py-4">Precio</th>
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
                  <td className="px-5 py-3 text-ink">
                    ${p.price.toLocaleString("es-CO")}
                  </td>
                  <td className="px-5 py-3 text-muted">{p.size}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        p.in_stock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.in_stock ? "Disponible" : "Vendido"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/mis-prendas/${p.id}/editar`}
                        className="text-accent hover:underline text-xs"
                      >
                        Editar
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteUserProduct(p.id);
                        }}
                      >
                        <button type="submit" className="text-red-500 hover:underline text-xs">
                          Eliminar
                        </button>
                      </form>
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
