import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { OrderStatus } from "@/types";

export const metadata = { title: "Mis pedidos — Dashboard" };

const statusColors: Record<OrderStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
  enviado: "bg-blue-100 text-blue-800",
};

export default async function MisPedidosPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Buscar por user_id o email
  const { data: orders } = await supabase
    .from("orders")
    .select("id, total, status, created_at, items, shipping_address")
    .or(`user_id.eq.${user!.id},customer_email.ilike.${user!.email}`)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-8">Mis pedidos</h1>

      {!orders?.length ? (
        <div className="bg-surface border border-border rounded p-10 text-center">
          <p className="text-muted">Aún no tienes pedidos.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const address = order.shipping_address as Record<string, string> | null;

            return (
              <div key={order.id} className="bg-surface border border-border rounded p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${statusColors[order.status as OrderStatus] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {order.status}
                    </span>
                    <p className="text-xs text-muted mt-2">
                      {new Date(order.created_at).toLocaleString("es-CO")}
                    </p>
                    {address && (
                      <p className="text-xs text-muted mt-1">
                        Envío a: {address.ciudad}, {address.direccion}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl text-ink">
                      ${order.total.toLocaleString("es-CO")}
                    </p>
                    <p className="text-xs text-muted">{items.length} prenda(s)</p>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {items.map((item: { product?: { name?: string; size?: string } }, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-bg border border-border rounded px-2 py-1 text-ink/70"
                      >
                        {item?.product?.name ?? "Prenda"} ({item?.product?.size})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
