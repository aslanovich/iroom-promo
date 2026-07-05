"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/catalog";

export type CartItem = Product & {
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  quantity: number;
  total: number;
  add: (product: Product) => void;
  remove: (id: string) => void;
  toggle: (product: Product) => void;
  changeQty: (id: string, delta: number) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

const CART_KEY = "iroom_cart";
const CartContext = createContext<CartContextValue | null>(null);
const priceFormatter = new Intl.NumberFormat("ru-RU");

export const formatPrice = (value: number) => `${priceFormatter.format(value)} ₽`;

const readInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readInitialCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { ...product, qty: 1 }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toggle = useCallback((product: Product) => {
    setItems((current) => {
      if (current.some((item) => item.id === product.id)) return current.filter((item) => item.id !== product.id);
      return [...current, { ...product, qty: 1 }];
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setItems((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const quantity = items.reduce((sum, item) => sum + item.qty, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const ids = new Set(items.map((item) => item.id));
    return {
      items,
      quantity,
      total,
      add,
      remove,
      toggle,
      changeQty,
      clear,
      has: (id) => ids.has(id),
    };
  }, [add, changeQty, clear, items, remove, toggle]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
