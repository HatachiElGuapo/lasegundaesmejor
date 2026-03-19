"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductFormData } from "@/components/admin/ProductForm";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(data: ProductFormData) {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const slug = `${slugify(data.name)}-${Date.now()}`;

  const { error } = await supabase.from("products").insert({
    ...data,
    slug,
    user_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProduct(id: string, data: ProductFormData) {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProduct(id: string) {
  const supabase = createSupabaseServerClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/productos");
}

export async function toggleProductStock(id: string, inStock: boolean) {
  const supabase = createSupabaseServerClient();
  await supabase.from("products").update({ in_stock: inStock }).eq("id", id);
  revalidatePath("/admin/productos");
}
