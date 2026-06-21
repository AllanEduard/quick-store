import type { Product, ProductGroup } from "@/types/product";

export function buildProductGroups(products: Product[]) {
  const groupsById = new Map<number, ProductGroup>();
  products.forEach((product) => {
    if (product.groupId === null || product.groupName === null) return;
    const group = groupsById.get(product.groupId);
    if (group) group.products.push(product);
    else {
      groupsById.set(product.groupId, {
        id: product.groupId,
        name: product.groupName,
        products: [product],
      });
    }
  });
  return Array.from(groupsById.values());
}

export function filterGroupsByName(groups: ProductGroup[], search: string) {
  const query = search.trim().toLowerCase();
  return query
    ? groups.filter((group) => group.name.toLowerCase().includes(query))
    : groups;
}

export function validateNewGroupName(name: string, groups: ProductGroup[]) {
  const cleanName = name.trim();
  if (!cleanName) return "Enter a group name.";
  if (
    groups.some((group) => group.name.toLowerCase() === cleanName.toLowerCase())
  ) {
    return "This group already exists. Select it below instead.";
  }
  return null;
}
