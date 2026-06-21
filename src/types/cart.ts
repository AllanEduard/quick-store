import type { Product } from "@/types/product";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type CartContextValue = {
  quantities: Record<number, number>;
  add: (productId: number) => void;
  changeQuantity: (productId: number, change: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  getQuantity: (productId: number) => number;
};
