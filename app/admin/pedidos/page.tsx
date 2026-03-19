import { createSupabaseServerClient } from "@/lib/supabase-server";
import { updateOrderStatus } from "./actions";
import type { OrderStatus } from "@/types";

export const metadata = { title: "Pedidos — Admin" };

const STATUS_OPTIONS: OrderStatus[] = ["pendiente", "pagado", "enviado"];

const statusColors: Record<OrderStatus, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  pagado: "bg-green-100 text-green-800",
  enviado: "bg-blue-100 text-blue-800",
};

function StatusUpdateButton({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  async function handleUpdate(formData: FormData) {
    "use server";
    const status = formData.get("status") as OrderStatus;
    if (status) await updateOrderStatus(orderId, status);
  }

  return (
    <form action={handleUpdate} className="flex items-center gap-2">
      <select
        name="status"
        defaultValue={currentStatus}
        className="text-xs border border-border rounded px-2 py-1 bg-surface text-ink focus:outline-none focus:border-accent"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="submit"
        className="text-xs px-3 py-1 bg-ink text-bg rounded hover:bg-accent transition-colors"
      >
        Actualizar
      </button>
    </form>
  );
}

export default async function AdminPedidosPage() {
  const supabase = createSupabaseServerClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_email, total, status, created_at, items, shipping_address")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-8">Pedidos</h1>

      {!orders?.length ? (
        <div className="bg-surface border border-border rounded p-10 text-center">
          <p className="text-muted">No hay pedidos aún.</p>
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
                    <p className="text-sm font-medium text-ink">{order.customer_email}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(order.created_at).toLocaleString("es-CO")}
                    </p>
                    {address && (
                      <p className="text-xs text-muted mt-1">
                        {address.nombre} — {address.ciudad}, {address.direccion}
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
                      <span key={i} className="text-xs bg-bg border border-border rounded px-2 py-1 text-ink/70">
                        {item?.product?.name ?? "Prenda"} ({item?.product?.size})
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${statusColors[order.status as OrderStatus] ?? "bg-gray-100 text-gray-800"}`}>
                    {order.status}
                  </span>
                  <StatusUpdateButton orderId={order.id} currentStatus={order.status as OrderStatus} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
