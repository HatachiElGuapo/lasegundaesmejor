"use client";

import { useState, useTransition } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import { CATEGORY_TREE } from "@/lib/categories";
import type { Product, ProductCategory } from "@/types";

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  size: string;
  condition: string;
  in_stock: boolean;
  images: string[];
}

interface ProductFormProps {
  product?: Product;
  mode?: "admin" | "user";
  action: (data: ProductFormData) => Promise<{ error?: string }>;
  submitLabel?: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "única"];
const CONDITIONS = [
  { value: "excelente", label: "Excelente" },
  { value: "buena", label: "Buena" },
  { value: "vintage", label: "Vintage" },
];

export default function ProductForm({
  product,
  action,
  submitLabel = "Guardar",
}: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [category, setCategory] = useState<string>(product?.category ?? "");
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");
  const [size, setSize] = useState(product?.size ?? "");
  const [condition, setCondition] = useState<string>(product?.condition ?? "excelente");
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  const subcategories =
    CATEGORY_TREE.find((c) => c.value === category)?.subcategories ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ProductFormData = {
      name,
      description,
      price: parseFloat(price),
      category,
      subcategory,
      size,
      condition,
      in_stock: inStock,
      images,
    };

    startTransition(async () => {
      const result = await action(data);
      if (result?.error) setError(result.error);
    });
  }

  const fieldClass =
    "w-full px-4 py-2.5 bg-surface border border-border rounded text-ink text-sm focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs font-medium text-ink/60 tracking-wide uppercase mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre */}
      <div>
        <label className={labelClass}>Nombre de la prenda</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          placeholder="Ej. Blazer de lino beige"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass}>Descripción editorial</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={fieldClass}
          placeholder="Historia y carácter de la prenda..."
        />
      </div>

      {/* Precio */}
      <div>
        <label className={labelClass}>Precio (COP)</label>
        <input
          type="number"
          required
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={fieldClass}
          placeholder="45000"
        />
      </div>

      {/* Categoría y subcategoría */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Categoría</label>
          <select
            required
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as ProductCategory);
              setSubcategory("");
            }}
            className={fieldClass}
          >
            <option value="">Seleccionar...</option>
            {CATEGORY_TREE.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Subcategoría</label>
          <select
            required
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className={fieldClass}
            disabled={!category}
          >
            <option value="">Seleccionar...</option>
            {subcategories.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Talla y condición */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Talla</label>
          <select
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={fieldClass}
          >
            <option value="">Seleccionar...</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Condición</label>
          <select
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className={fieldClass}
          >
            {CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disponible — admin puede togglear; usuario también puede marcar como vendido */}
      <div className="flex items-center gap-3">
        <input
          id="in_stock"
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="w-4 h-4 accent-accent"
        />
        <label htmlFor="in_stock" className="text-sm text-ink">
          Disponible (en stock)
        </label>
      </div>

      {/* Imágenes */}
      <div>
        <label className={labelClass}>Imágenes</label>
        <ImageUploader
          existingImages={images}
          onImagesChange={setImages}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-ink text-bg text-sm font-medium tracking-widest uppercase hover:bg-accent transition-colors disabled:opacity-50 rounded"
      >
        {isPending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
