import type { Product, ProductFormDraft, ProductGroup } from "@/types/product";

export type ProductFilter = "all" | "shown" | "hidden";

export type ManageListItem =
  | { kind: "heading"; label: string }
  | { kind: "product"; product: Product }
  | { kind: "group"; group: ProductGroup };

export type ProductManagerCounts = {
  all: number;
  shown: number;
  hidden: number;
};

export type ProductFormInput = {
  name: string;
  price: string;
  groupId: number | null;
  newGroupName?: string;
};

export type ProductFormValidation =
  | { ok: true; draft: ProductFormDraft }
  | { ok: false; error: string };
