import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export const metadata = { title: "Mi cuenta — La Segunda" };

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: myProducts }, { count: activeListings }] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .eq("in_stock", true),
  ]);

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, items")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">Bienvenida</h1>
      <p className="text-sm text-muted mb-8">{user?.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-surface border border-border rounded p-5">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Mis prendas</p>
          <p className="font-display text-4xl text-ink">{myProducts ?? 0}</p>
        </div>
        <div className="bg-surface border border-border rounded p-5">
          <p className="text-xs text-muted uppercase tracking-widest mb-1">Disponibles</p>
          <p className="font-display text-4xl text-ink">{activeListings ?? 0}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Link
          href="/dashboard/mis-prendas/nueva"
          className="bg-ink text-bg p-5 rounded hover:bg-accent transition-colors text-center"
        >
          <p className="font-display text-lg">Subir prenda</p>
          <p className="text-xs mt-1 opacity-70">Publica tu ropa de segunda mano</p>
        </Link>
        <Link
          href="/dashboard/mis-pedidos"
          className="bg-surface border border-border p-5 rounded hover:border-accent transition-colors text-center"
        >
          <p className="font-display text-lg text-ink">Mis pedidos</p>
          <p className="text-xs mt-1 text-muted">Revisa el estado de tus compras</p>
        </Link>
      </div>

      {/* Recent orders */}
      {(recentOrders?.length ?? 0) > 0 && (
        <div className="bg-surface border border-border rounded p-6">
          <h2 className="font-display text-xl text-ink mb-4">Últimos pedidos</h2>
          <div className="space-y-3">
            {recentOrders!.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between text-sm border-b border-border/50 last:border-0 pb-3 last:pb-0"
              >
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      order.status === "pagado"
                        ? "bg-green-100 text-green-800"
                        : order.status === "enviado"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="ml-2 text-muted text-xs">
                    {new Date(order.created_at).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <span className="font-medium text-ink">
                  ${order.total.toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
