import { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DuplicateGroupError } from "@/errors/inventory";
import type { ProductManagerModalProps } from "@/types/components";
import type { ProductFilter } from "@/types/inventory";
import type { Product, ProductFormDraft } from "@/types/product";
import { formatPeso } from "@/utils/currency";
import {
  buildManageItems,
  filterProducts,
  getProductManagerCounts,
  matchesProductVisibility,
} from "@/utils/productManager";
import { ManagedProductRow } from "./ManagedProductRow";
import { ProductEditor } from "./ProductEditor";
import { ProductGroupDetail } from "./ProductGroupDetail";
import { ProductGroupRow } from "./ProductGroupRow";
import { ProductManagerListHeader } from "./ProductManagerListHeader";

export function ProductManagerModal({
  visible,
  products,
  groups,
  onClose,
  onCreate,
  onUpdate,
  onRenameGroup,
  onToggleVisibility,
  onDelete,
  onProductDeleted,
}: ProductManagerModalProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductGroupId, setNewProductGroupId] = useState<number | null>();
  const [groupNameDraft, setGroupNameDraft] = useState<string | null>(null);
  const [groupNameError, setGroupNameError] = useState("");
  const [isSavingGroupName, setIsSavingGroupName] = useState(false);

  const selectedGroup =
    groups.find((group) => group.id === selectedGroupId) ?? null;
  const query = search.trim().toLowerCase();
  const matchingProducts = useMemo(
    () => filterProducts(products, filter, query),
    [filter, products, query],
  );
  const selectedGroupProducts =
    selectedGroup?.products.filter((product) =>
      matchesProductVisibility(product, filter),
    ) ?? [];
  const counts = useMemo(
    () => getProductManagerCounts(products, groups),
    [groups, products],
  );
  const manageItems = useMemo(
    () => buildManageItems(products, groups, filter),
    [filter, groups, products],
  );

  const resetAndClose = () => {
    setSearch("");
    setFilter("all");
    setSelectedGroupId(null);
    setGroupNameDraft(null);
    setGroupNameError("");
    onClose();
  };

  const goBack = () => {
    if (editingProduct) return setEditingProduct(null);
    if (newProductGroupId !== undefined) return setNewProductGroupId(undefined);
    if (groupNameDraft !== null) {
      setGroupNameDraft(null);
      setGroupNameError("");
      return;
    }
    if (selectedGroup) return setSelectedGroupId(null);
    resetAndClose();
  };

  const saveGroupName = async () => {
    if (!selectedGroup || groupNameDraft === null) return;
    const cleanName = groupNameDraft.trim();
    if (!cleanName) {
      setGroupNameError("Enter a group name.");
      return;
    }
    if (cleanName === selectedGroup.name) {
      setGroupNameDraft(null);
      setGroupNameError("");
      return;
    }

    setIsSavingGroupName(true);
    try {
      await onRenameGroup(selectedGroup.id, cleanName);
      setGroupNameDraft(null);
      setGroupNameError("");
    } catch (error) {
      setGroupNameError(
        error instanceof DuplicateGroupError
          ? "A group with this name already exists."
          : "Could not rename the group. Please try again.",
      );
    } finally {
      setIsSavingGroupName(false);
    }
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
    Alert.alert(
      product.name,
      `${product.groupName ?? "Ungrouped"} · ${formatPeso(product.price)}`,
      [
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
      ],
    );
  };

  const listHeader = (
    <ProductManagerListHeader
      search={search}
      query={query}
      filter={filter}
      counts={counts}
      onAddProduct={() => setNewProductGroupId(null)}
      onSearchChange={setSearch}
      onFilterChange={setFilter}
    />
  );

  const emptyList = (
    <View className="items-center rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-8">
      <Text className="font-bold text-stone-700">
        {query
          ? "No matching products"
          : `No ${filter === "all" ? "products" : filter + " products"}`}
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
            key={
              editingProduct?.id ?? `new-${newProductGroupId ?? "ungrouped"}`
            }
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
          <ProductGroupDetail
            group={selectedGroup}
            products={selectedGroupProducts}
            nameDraft={groupNameDraft}
            nameError={groupNameError}
            isSavingName={isSavingGroupName}
            onBack={goBack}
            onStartRename={() => {
              setGroupNameDraft(selectedGroup.name);
              setGroupNameError("");
            }}
            onNameChange={(value) => {
              setGroupNameDraft(value);
              setGroupNameError("");
            }}
            onSaveName={() => void saveGroupName()}
            onCancelRename={() => {
              setGroupNameDraft(null);
              setGroupNameError("");
            }}
            onAddVariation={() => setNewProductGroupId(selectedGroup.id)}
            onEditProduct={setEditingProduct}
            onProductActions={showActions}
          />
        ) : (
          <>
            <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
              <View>
                <Text className="text-2xl font-black text-stone-900">
                  Manage products
                </Text>
                <Text className="mt-1 text-sm text-stone-500">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} ·{" "}
                  {groups.length} groups
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
