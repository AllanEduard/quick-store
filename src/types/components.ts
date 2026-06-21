import type { CartItem } from "@/types/cart";
import type { ProductFilter, ProductManagerCounts } from "@/types/inventory";
import type { Product, ProductFormDraft, ProductGroup } from "@/types/product";

export type AppHeaderProps = {
  onManage: () => void;
};

export type QuantityButtonProps = {
  label: "+" | "−";
  onPress: () => void;
};

export type CartSectionProps = {
  items: CartItem[];
  onChangeQuantity: (productId: number, change: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
};

export type CartSummaryProps = {
  itemCount: number;
  total: number;
  onPress: () => void;
};

export type ProductCardProps = {
  product: Product;
  quantity: number;
  onPress: () => void;
};

export type ProductCatalogProps = {
  products: Product[];
  isLoading: boolean;
  error: string;
  getQuantity: (productId: number) => number;
  onAdd: (productId: number) => void;
};

export type ProductSearchProps = {
  products: Product[];
  getQuantity: (productId: number) => number;
  onAdd: (productId: number) => void;
};

export type ManagedProductRowProps = {
  product: Product;
  showGroup?: boolean;
  onEdit: () => void;
  onActions: () => void;
};

export type ProductGroupRowProps = {
  group: ProductGroup;
  onPress: () => void;
};

export type GroupPickerModalProps = {
  visible: boolean;
  groups: ProductGroup[];
  selectedGroupId: number | null;
  pendingGroupName?: string;
  onClose: () => void;
  onSelect: (groupId: number) => void;
  onCreate: (groupName: string) => void;
  onClear: () => void;
};

export type ProductEditorProps = {
  product: Product | "new";
  groups: ProductGroup[];
  initialGroupId?: number | null;
  title?: string;
  onBack: () => void;
  onSave: (draft: ProductFormDraft) => Promise<void>;
};

export type ProductManagerModalProps = {
  visible: boolean;
  products: Product[];
  groups: ProductGroup[];
  onClose: () => void;
  onCreate: (draft: ProductFormDraft) => Promise<void>;
  onUpdate: (id: number, draft: ProductFormDraft) => Promise<void>;
  onRenameGroup: (id: number, name: string) => Promise<void>;
  onToggleVisibility: (product: Product) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onProductDeleted: (id: number) => void;
};

export type ProductManagerListHeaderProps = {
  search: string;
  query: string;
  filter: ProductFilter;
  counts: ProductManagerCounts;
  onAddProduct: () => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (filter: ProductFilter) => void;
};

export type ProductGroupDetailProps = {
  group: ProductGroup;
  products: Product[];
  nameDraft: string | null;
  nameError: string;
  isSavingName: boolean;
  onBack: () => void;
  onStartRename: () => void;
  onNameChange: (value: string) => void;
  onSaveName: () => void;
  onCancelRename: () => void;
  onAddVariation: () => void;
  onEditProduct: (product: Product) => void;
  onProductActions: (product: Product) => void;
};
