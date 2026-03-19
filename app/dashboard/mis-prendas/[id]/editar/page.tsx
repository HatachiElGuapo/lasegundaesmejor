import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ProductForm from "@/components/admin/ProductForm";
import { updateUserProduct } from "../../actions";
import type { ProductFormData } from "@/components/admin/ProductForm";

export const metadata = { title: "Editar prenda — Dashboard" };

export default async function EditarPrendaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!product) notFound();

  async function handleUpdate(data: ProductFormData) {
    "use server";
    return updateUserProduct(params.id, data);
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/mis-prendas" className="text-muted hover:text-ink text-sm">
          ← Mis prendas
        </Link>
        <h1 className="font-display text-3xl text-ink">Editar prenda</h1>
      </div>

      <div className="bg-surface border border-border rounded p-8">
        <ProductForm
          product={product}
          mode="user"
          action={handleUpdate}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
