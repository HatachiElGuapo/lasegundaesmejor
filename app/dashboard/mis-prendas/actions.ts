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

export async function createUserProduct(data: ProductFormData) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const slug = `${slugify(data.name)}-${Date.now()}`;

  const { error } = await supabase.from("products").insert({
    ...data,
    slug,
    user_id: user.id,
    in_stock: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/mis-prendas");
  redirect("/dashboard/mis-prendas");
}

export async function updateUserProduct(id: string, data: ProductFormData) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar que el producto pertenece al usuario
  const { data: existing } = await supabase
    .from("products")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== user.id) {
    return { error: "No tienes permiso para editar este producto" };
  }

  const { error } = await supabase.from("products").update(data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/mis-prendas");
  redirect("/dashboard/mis-prendas");
}

export async function deleteUserProduct(id: string) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/mis-prendas");
}
