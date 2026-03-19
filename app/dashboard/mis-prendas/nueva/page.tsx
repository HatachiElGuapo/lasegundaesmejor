import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { createUserProduct } from "../actions";
import type { ProductFormData } from "@/components/admin/ProductForm";

export const metadata = { title: "Subir prenda — Dashboard" };

async function handleCreate(data: ProductFormData) {
  "use server";
  return createUserProduct(data);
}

export default function NuevaPrendaPage() {
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/mis-prendas" className="text-muted hover:text-ink text-sm">
          ← Mis prendas
        </Link>
        <h1 className="font-display text-3xl text-ink">Subir prenda</h1>
      </div>

      <div className="bg-surface border border-border rounded p-8">
        <ProductForm mode="user" action={handleCreate} submitLabel="Publicar prenda" />
      </div>
    </div>
  );
}
