"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@/types";

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = createSupabaseServerClient();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/pedidos");
}
