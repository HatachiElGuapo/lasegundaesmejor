"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toggleProductStock } from "@/app/admin/productos/actions";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { normalizeSearch } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  size: string;
  in_stock: boolean;
  images: string[] | null;
  reference: string | null;
}

export default function ProductsTable({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? products.filter((p) => {
        const term = normalizeSearch(q);
        return (
          normalizeSearch(p.name).includes(term) ||
          normalizeSearch(p.reference ?? "").includes(term) ||
          normalizeSearch(p.category).includes(term)
        );
      })
    : products;

  return (
    <>
      {/* Buscador en tiempo real */}
      <div className="relative mb-6">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, referencia o categoría..."
          aria-label="Buscar productos"
          className="w-full px-4 py-2.5 pr-10 bg-surface border border-border rounded text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      {q.trim() && (
        <p className="text-sm text-muted mb-4">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para{" "}
          <span className="text-ink font-medium">"{q.trim()}"</span>
        </p>
      )}

      {!filtered.length ? (
        <div className="bg-surface border border-border rounded p-10 text-center">
          <p className="text-muted">
            {q.trim() ? "Sin resultados para esa búsqueda." : "No hay productos aún."}
          </p>
          {!q.trim() && (
            <Link href="/admin/productos/nuevo" className="text-sm text-accent mt-2 inline-block">
              Crear el primero →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted uppercase tracking-widest">
                <th className="px-5 py-4">Prenda</th>
                <th className="px-5 py-4">Ref.</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Cat.</th>
                <th className="px-5 py-4">Talla</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const toggleAction = toggleProductStock.bind(null, p.id, !p.in_stock);
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-bg/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 border border-border">
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          </div>
                        )}
                        <span className="text-ink font-medium line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-muted tracking-wider">
                        {p.reference ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink">
                      ${p.price.toLocaleString("es-CO")}
                    </td>
                    <td className="px-5 py-3 text-muted capitalize">{p.category}</td>
                    <td className="px-5 py-3 text-muted">{p.size}</td>
                    <td className="px-5 py-3">
                      <form action={toggleAction}>
                        <button
                          type="submit"
                          className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                            p.in_stock
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {p.in_stock ? "En stock" : "Vendido"}
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/productos/${p.id}/editar`}
                          className="text-accent hover:underline text-xs"
                        >
                          Editar
                        </Link>
                        <DeleteProductButton productId={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
