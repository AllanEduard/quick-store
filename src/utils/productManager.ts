import type {
  ManageListItem,
  ProductFilter,
  ProductManagerCounts,
} from "@/types/inventory";
import type { Product, ProductGroup } from "@/types/product";

export function matchesProductVisibility(
  product: Product,
  filter: ProductFilter,
) {
  return (
    filter === "all" ||
    (filter === "shown" && product.isActive) ||
    (filter === "hidden" && !product.isActive)
  );
}

export function filterProducts(
  products: Product[],
  filter: ProductFilter,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();
  return products.filter(
    (product) =>
      matchesProductVisibility(product, filter) &&
      (product.name.toLowerCase().includes(normalizedQuery) ||
        product.groupName?.toLowerCase().includes(normalizedQuery)),
  );
}

export function filterGroups(groups: ProductGroup[], filter: ProductFilter) {
  return groups.filter((group) => {
    const shownCount = group.products.filter(
      (product) => product.isActive,
    ).length;
    return (
      filter === "all" ||
      (filter === "shown" && shownCount > 0) ||
      (filter === "hidden" && shownCount < group.products.length)
    );
  });
}

export function getProductManagerCounts(
  products: Product[],
  groups: ProductGroup[],
): ProductManagerCounts {
  const ungrouped = products.filter((product) => product.groupId === null);
  return {
    all: groups.length + ungrouped.length,
    shown:
      groups.filter((group) =>
        group.products.some((product) => product.isActive),
      ).length + ungrouped.filter((product) => product.isActive).length,
    hidden:
      groups.filter((group) =>
        group.products.some((product) => !product.isActive),
      ).length + ungrouped.filter((product) => !product.isActive).length,
  };
}

export function buildManageItems(
  products: Product[],
  groups: ProductGroup[],
  filter: ProductFilter,
): ManageListItem[] {
  const ungrouped = products.filter(
    (product) =>
      product.groupId === null && matchesProductVisibility(product, filter),
  );
  const visibleGroups = filterGroups(groups, filter);

  return [
    ...(ungrouped.length
      ? [
          { kind: "heading", label: "Ungrouped products" } as const,
          ...ungrouped.map(
            (product) => ({ kind: "product", product }) as const,
          ),
        ]
      : []),
    ...(visibleGroups.length
      ? [
          { kind: "heading", label: "Product groups" } as const,
          ...visibleGroups.map((group) => ({ kind: "group", group }) as const),
        ]
      : []),
  ];
}
