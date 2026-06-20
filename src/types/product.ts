export type Product = {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  groupId: number | null;
  groupName: string | null;
};

export type ProductDraft = {
  name: string;
  price: number;
};

export type ProductGroup = {
  id: number;
  name: string;
  products: Product[];
};

export type ProductFormDraft = ProductDraft & {
  groupId: number | null;
  newGroupName?: string;
};
