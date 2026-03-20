import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProductsTable from "@/components/admin/ProductsTable";

export const metadata = { title: "Productos — Admin" };

export default async function AdminProductosPage() {
  const supabase = createSupabaseServerClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, category, size, in_stock, images, reference, created_at")
    .order("created_at", { ascending: false });

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

      <ProductsTable products={products ?? []} />
    </div>
  );
}
