import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import { updateProduct } from "../../actions";
import type { ProductFormData } from "@/components/admin/ProductForm";

export const metadata = { title: "Editar producto — Admin" };

export default async function EditarProductoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  async function handleUpdate(data: ProductFormData) {
    "use server";
    return updateProduct(params.id, data);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-muted hover:text-ink text-sm">
          ← Productos
        </Link>
        <h1 className="font-display text-3xl text-ink">Editar producto</h1>
      </div>

      <div className="bg-surface border border-border rounded p-8">
        <ProductForm
          product={product}
          mode="admin"
          action={handleUpdate}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
