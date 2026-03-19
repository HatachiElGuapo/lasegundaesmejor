import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata = { title: "Admin — La Segunda" };

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();

  const [{ count: totalProducts }, { count: inStockCount }, { count: totalOrders }, { count: pendingOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("in_stock", true),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pendiente"),
    ]);

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, customer_email, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Productos totales", value: totalProducts ?? 0 },
    { label: "En stock", value: inStockCount ?? 0 },
    { label: "Pedidos totales", value: totalOrders ?? 0 },
    { label: "Pedidos pendientes", value: pendingOrders ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-8">Resumen</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded p-5">
            <p className="text-xs text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <p className="font-display text-4xl text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-surface border border-border rounded p-6">
        <h2 className="font-display text-xl text-ink mb-4">Últimos pedidos</h2>
        {!recentOrders?.length ? (
          <p className="text-sm text-muted">Sin pedidos aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-widest">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 text-ink">{order.customer_email}</td>
                  <td className="py-3 pr-4 text-ink">
                    ${order.total.toLocaleString("es-CO")}
                  </td>
                  <td className="py-3 pr-4">
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
                  </td>
                  <td className="py-3 text-muted">
                    {new Date(order.created_at).toLocaleDateString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
