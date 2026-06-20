import { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type {
  Product,
  ProductFormDraft,
  ProductGroup,
} from "@/types/product";
import { formatPeso } from "@/utils/currency";
import { ManagedProductRow } from "./ManagedProductRow";
import { ProductEditor } from "./ProductEditor";
import { ProductGroupRow } from "./ProductGroupRow";

type ProductFilter = "all" | "shown" | "hidden";
type ManageListItem =
  | { kind: "heading"; label: string }
  | { kind: "product"; product: Product }
  | { kind: "group"; group: ProductGroup };

type ProductManagerModalProps = {
  visible: boolean;
  products: Product[];
  groups: ProductGroup[];
  onClose: () => void;
  onCreate: (draft: ProductFormDraft) => Promise<void>;
  onUpdate: (id: number, draft: ProductFormDraft) => Promise<void>;
  onToggleVisibility: (product: Product) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onProductDeleted: (id: number) => void;
};

export function ProductManagerModal({
  visible,
  products,
  groups,
  onClose,
  onCreate,
  onUpdate,
  onToggleVisibility,
  onDelete,
  onProductDeleted,
}: ProductManagerModalProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductGroupId, setNewProductGroupId] = useState<number | null>();

  const selectedGroup = groups.find((group) => group.id === selectedGroupId) ?? null;
  const query = search.trim().toLowerCase();
  const matchesVisibility = (product: Product) =>
    filter === "all" ||
    (filter === "shown" && product.isActive) ||
    (filter === "hidden" && !product.isActive);

  const matchingProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          matchesVisibility(product) &&
          (product.name.toLowerCase().includes(query) ||
            product.groupName?.toLowerCase().includes(query)),
      ),
    // matchesVisibility is a small pure predicate driven only by filter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, products, query],
  );

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) => {
        const shownCount = group.products.filter((product) => product.isActive).length;
        return (
          filter === "all" ||
          (filter === "shown" && shownCount > 0) ||
          (filter === "hidden" && shownCount < group.products.length)
        );
      }),
    [filter, groups],
  );

  const shownGroupCount = groups.filter((group) =>
    group.products.some((product) => product.isActive),
  ).length;
  const hiddenGroupCount = groups.filter((group) =>
    group.products.some((product) => !product.isActive),
  ).length;
  const ungroupedProducts = products.filter(
    (product) => product.groupId === null && matchesVisibility(product),
  );
  const allUngroupedCount = products.filter((product) => product.groupId === null).length;
  const shownUngroupedCount = products.filter(
    (product) => product.groupId === null && product.isActive,
  ).length;
  const hiddenUngroupedCount = allUngroupedCount - shownUngroupedCount;
  const selectedGroupProducts =
    selectedGroup?.products.filter((product) => matchesVisibility(product)) ?? [];
  const manageItems: ManageListItem[] = [
    ...(ungroupedProducts.length
      ? [
          { kind: "heading", label: "Ungrouped products" } as const,
          ...ungroupedProducts.map((product) => ({ kind: "product", product }) as const),
        ]
      : []),
    ...(filteredGroups.length
      ? [
          { kind: "heading", label: "Product groups" } as const,
          ...filteredGroups.map((group) => ({ kind: "group", group }) as const),
        ]
      : []),
  ];

  const resetAndClose = () => {
    setSearch("");
    setFilter("all");
    setSelectedGroupId(null);
    onClose();
  };

  const goBack = () => {
    if (editingProduct) return setEditingProduct(null);
    if (newProductGroupId !== undefined) return setNewProductGroupId(undefined);
    if (selectedGroup) return setSelectedGroupId(null);
    resetAndClose();
  };

  const saveProduct = async (draft: ProductFormDraft) => {
    if (editingProduct) await onUpdate(editingProduct.id, draft);
    else await onCreate(draft);
    setEditingProduct(null);
    setNewProductGroupId(undefined);
  };

  const toggleVisibility = async (product: Product) => {
    try {
      await onToggleVisibility(product);
    } catch {
      Alert.alert("Could not update product", "Please try again.");
    }
  };

  const confirmDelete = (product: Product) => {
    Alert.alert(
      "Delete product?",
      `${product.name} will be permanently removed. If it is the group's last product, the group will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await onDelete(product.id);
                onProductDeleted(product.id);
              } catch {
                Alert.alert("Could not delete product", "Please try again.");
              }
            })();
          },
        },
      ],
    );
  };

  const showActions = (product: Product) => {
    Alert.alert(product.name, `${product.groupName ?? "Ungrouped"} · ${formatPeso(product.price)}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: product.isActive ? "Hide" : "Show",
        onPress: () => void toggleVisibility(product),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDelete(product),
      },
    ]);
  };

  const filterTabs = (
    <View className="mb-4 flex-row rounded-2xl bg-stone-200 p-1">
      {(
        [
          ["all", "All", groups.length + allUngroupedCount],
          ["shown", "Shown", shownGroupCount + shownUngroupedCount],
          ["hidden", "Hidden", hiddenGroupCount + hiddenUngroupedCount],
        ] as const
      ).map(([value, label, count]) => {
        const isSelected = filter === value;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => setFilter(value)}
            className={`flex-1 items-center rounded-xl py-2.5 ${
              isSelected ? "bg-white" : ""
            }`}
          >
            <Text
              className={`text-sm font-bold ${
                isSelected ? "text-emerald-700" : "text-stone-500"
              }`}
            >
              {label} {count}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const listHeader = (
    <View>
      <Pressable
        onPress={() => setNewProductGroupId(null)}
        className="mb-4 h-14 flex-row items-center justify-center rounded-2xl bg-emerald-700 active:bg-emerald-800"
      >
        <Text className="mr-2 text-xl text-white">+</Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          className="flex-shrink text-center text-base font-black text-white"
        >
          Add product
        </Text>
      </Pressable>
      <View className="mb-4 flex-row items-center rounded-2xl border border-stone-200 bg-white px-4">
        <Text className="mr-3 text-lg text-stone-400">⌕</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search individual products"
          placeholder="Find an individual product"
          placeholderTextColor="#A8A29E"
          className="h-12 flex-1 text-base text-stone-900"
        />
        {search ? (
          <Pressable onPress={() => setSearch("")} className="p-2">
            <Text className="text-lg text-stone-400">×</Text>
          </Pressable>
        ) : null}
      </View>
      {filterTabs}
      {query ? (
        <Text className="mb-3 text-sm font-semibold text-stone-500">
          Individual product results
        </Text>
      ) : null}
    </View>
  );

  const emptyList = (
    <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-8">
      <Text className="font-bold text-stone-700">
        {query ? "No matching products" : `No ${filter === "all" ? "products" : filter + " products"}`}
      </Text>
      <Text className="mt-1 text-center text-sm text-stone-500">
        {query ? "Try a different search or filter." : "Add a product above."}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={goBack}>
      <SafeAreaView className="flex-1 bg-[#FBF8F2]">
        {editingProduct || newProductGroupId !== undefined ? (
          <ProductEditor
            key={editingProduct?.id ?? `new-${newProductGroupId ?? "ungrouped"}`}
            product={editingProduct ?? "new"}
            groups={groups}
            initialGroupId={newProductGroupId ?? null}
            title={
              newProductGroupId
                ? `Add to ${groups.find((group) => group.id === newProductGroupId)?.name}`
                : undefined
            }
            onBack={goBack}
            onSave={saveProduct}
          />
        ) : selectedGroup ? (
          <>
            <View className="flex-row items-center border-b border-stone-200 bg-white px-5 py-4">
              <Pressable onPress={goBack} className="mr-4 py-2 pr-2">
                <Text className="text-base font-bold text-stone-600">‹ Back</Text>
              </Pressable>
              <View className="flex-1">
                <Text numberOfLines={1} className="text-xl font-black text-stone-900">
                  {selectedGroup.name}
                </Text>
                <Text className="mt-1 text-sm text-stone-500">
                  {selectedGroup.products.length} variations
                </Text>
              </View>
            </View>
            <FlatList
              data={selectedGroupProducts}
              keyExtractor={(product) => String(product.id)}
              contentContainerClassName="px-5 pb-8 pt-5"
              ListHeaderComponent={
                <Pressable
                  onPress={() => setNewProductGroupId(selectedGroup.id)}
                  className="mb-4 h-14 flex-row items-center justify-center rounded-2xl bg-emerald-700 active:bg-emerald-800"
                >
                  <Text className="mr-2 text-xl text-white">+</Text>
                  <Text className="text-base font-black text-white">Add variation</Text>
                </Pressable>
              }
              renderItem={({ item }) => (
                <ManagedProductRow
                  product={item}
                  onEdit={() => setEditingProduct(item)}
                  onActions={() => showActions(item)}
                />
              )}
            />
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
              <View>
                <Text className="text-2xl font-black text-stone-900">Manage products</Text>
                <Text className="mt-1 text-sm text-stone-500">
                  {products.length} {products.length === 1 ? "product" : "products"} · {groups.length} groups
                </Text>
              </View>
              <Pressable onPress={resetAndClose} className="p-3">
                <Text className="text-2xl text-stone-500">×</Text>
              </Pressable>
            </View>
            {query ? (
              <FlatList
                data={matchingProducts}
                keyExtractor={(product) => String(product.id)}
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="px-5 pb-8 pt-5"
                ListHeaderComponent={listHeader}
                ListEmptyComponent={emptyList}
                renderItem={({ item }) => (
                  <ManagedProductRow
                    product={item}
                    showGroup
                    onEdit={() => setEditingProduct(item)}
                    onActions={() => showActions(item)}
                  />
                )}
              />
            ) : (
              <FlatList
                data={manageItems}
                keyExtractor={(item, index) =>
                  item.kind === "heading"
                    ? `heading-${item.label}`
                    : item.kind === "group"
                      ? `group-${item.group.id}`
                      : `product-${item.product.id}-${index}`
                }
                keyboardShouldPersistTaps="handled"
                contentContainerClassName="px-5 pb-8 pt-5"
                ListHeaderComponent={listHeader}
                ListEmptyComponent={emptyList}
                renderItem={({ item }) => {
                  if (item.kind === "heading") {
                    return (
                      <Text className="mb-2 mt-1 text-sm font-black uppercase tracking-wider text-stone-500">
                        {item.label}
                      </Text>
                    );
                  }
                  if (item.kind === "group") {
                    return (
                      <ProductGroupRow
                        group={item.group}
                        onPress={() => setSelectedGroupId(item.group.id)}
                      />
                    );
                  }
                  return (
                    <ManagedProductRow
                      product={item.product}
                      onEdit={() => setEditingProduct(item.product)}
                      onActions={() => showActions(item.product)}
                    />
                  );
                }}
              />
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
