import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { CartContextValue } from "@/types/cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const add = useCallback((productId: number) => {
    setQuantities((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  }, []);

  const changeQuantity = useCallback((productId: number, change: number) => {
    setQuantities((current) => {
      const nextQuantity = (current[productId] ?? 0) + change;
      if (nextQuantity <= 0) {
        const { [productId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [productId]: nextQuantity };
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setQuantities((current) => {
      const { [productId]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const clear = useCallback(() => setQuantities({}), []);
  const getQuantity = useCallback(
    (productId: number) => quantities[productId] ?? 0,
    [quantities],
  );

  const value = useMemo(
    () => ({ quantities, add, changeQuantity, remove, clear, getQuantity }),
    [add, changeQuantity, clear, getQuantity, quantities, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCartContext must be used within CartProvider");
  return context;
}
