import type { Product } from "@/types/product";

export function searchActiveProducts(products: Product[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  return products.filter(
    (product) =>
      product.isActive &&
      (product.name.toLowerCase().includes(normalizedQuery) ||
        product.groupName?.toLowerCase().includes(normalizedQuery)),
  );
}
