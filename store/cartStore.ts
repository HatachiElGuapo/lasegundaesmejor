"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product) => {
        const already = get().isInCart(product.id);
        if (already) return;
        set((state) => ({
          items: [...state.items, { product, quantity: 1 }],
        }));
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      clearCart: () => set({ items: [] }),

      isInCart: (productId) =>
        get().items.some((item) => item.product.id === productId),

      total: () =>
        get().items.reduce((sum, item) => sum + item.product.price, 0),
    }),
    { name: "lsem-cart" }
  )
);
