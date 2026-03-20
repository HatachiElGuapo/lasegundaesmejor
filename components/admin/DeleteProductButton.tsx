"use client";

import { deleteProduct } from "@/app/admin/productos/actions";

export default function DeleteProductButton({ productId }: { productId: string }) {
  async function handleDelete() {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteProduct(productId);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-red-500 hover:underline text-xs"
    >
      Eliminar
    </button>
  );
}
