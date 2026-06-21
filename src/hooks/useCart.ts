import { useMemo } from "react";

import { useCartContext } from "@/contexts/CartContext";
import type { CartItem } from "@/types/cart";
import type { Product } from "@/types/product";

export function useCart(products: Product[]) {
  const { quantities, add, changeQuantity, remove, clear, getQuantity } =
    useCartContext();

  const items = useMemo(
    () =>
      Object.entries(quantities).flatMap<CartItem>(([id, quantity]) => {
        const product = products.find(
          (candidate) => candidate.id === Number(id),
        );
        return product ? [{ product, quantity }] : [];
      }),
    [products, quantities],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  return {
    items,
    itemCount,
    total,
    add,
    changeQuantity,
    remove,
    clear,
    getQuantity,
  };
}
