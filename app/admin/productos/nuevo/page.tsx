import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { createProduct } from "../actions";
import type { ProductFormData } from "@/components/admin/ProductForm";

export const metadata = { title: "Nuevo producto — Admin" };

async function handleCreate(data: ProductFormData) {
  "use server";
  return createProduct(data);
}

export default function NuevoProductoPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="text-muted hover:text-ink text-sm">
          ← Productos
        </Link>
        <h1 className="font-display text-3xl text-ink">Nuevo producto</h1>
      </div>

      <div className="bg-surface border border-border rounded p-8">
        <ProductForm mode="admin" action={handleCreate} submitLabel="Crear producto" />
      </div>
    </div>
  );
}
