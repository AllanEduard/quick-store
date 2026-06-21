import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { DuplicateGroupError, DuplicateProductError } from "@/errors/inventory";
import type { ProductEditorProps } from "@/types/components";
import { validateProductForm } from "@/utils/productForm";
import { GroupPickerModal } from "./GroupPickerModal";

export function ProductEditor({
  product,
  groups,
  initialGroupId = null,
  title,
  onBack,
  onSave,
}: ProductEditorProps) {
  const [name, setName] = useState(product === "new" ? "" : product.name);
  const [price, setPrice] = useState(
    product === "new" ? "" : String(product.price),
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [groupId, setGroupId] = useState<number | null>(
    product === "new" ? initialGroupId : product.groupId,
  );
  const [newGroupName, setNewGroupName] = useState<string>();
  const [isGroupPickerOpen, setIsGroupPickerOpen] = useState(false);
  const selectedGroup = groups.find((group) => group.id === groupId);

  const handleSave = async () => {
    const result = validateProductForm({ name, price, groupId, newGroupName });
    if (!result.ok) return setError(result.error);

    setIsSaving(true);
    try {
      await onSave(result.draft);
    } catch (saveError) {
      setError(
        saveError instanceof DuplicateProductError
          ? "A product with this name already exists."
          : saveError instanceof DuplicateGroupError
            ? "This group already exists. Select it from the group list."
            : "Could not save this product. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <View className="flex-row items-center border-b border-stone-200 bg-white px-5 py-4">
        <Pressable onPress={onBack} className="mr-4 py-2 pr-2">
          <Text className="text-base font-bold text-stone-600">‹ Back</Text>
        </Pressable>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          className="flex-1 text-xl font-black text-stone-900"
        >
          {title ?? (product === "new" ? "Add product" : "Edit product")}
        </Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" className="px-5 pt-7">
        <Text className="mb-2 text-sm font-bold text-stone-700">
          Product name *
        </Text>
        <TextInput
          autoFocus
          value={name}
          onChangeText={setName}
          placeholder="e.g. Shampoo sachet"
          placeholderTextColor="#A8A29E"
          className="h-14 rounded-2xl border border-stone-300 bg-white px-4 text-base text-stone-900"
        />
        <Text className="mb-2 mt-5 text-sm font-bold text-stone-700">
          Price *
        </Text>
        <View className="flex-row items-center rounded-2xl border border-stone-300 bg-white px-4">
          <Text className="mr-2 text-lg font-bold text-stone-500">₱</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#A8A29E"
            className="h-14 flex-1 text-base text-stone-900"
          />
        </View>
        <Pressable
          onPress={() => setIsGroupPickerOpen(true)}
          className={`mt-4 rounded-2xl border px-4 py-4 ${
            selectedGroup || newGroupName
              ? "border-emerald-300 bg-emerald-50"
              : "border-stone-300 bg-white"
          }`}
        >
          <Text className="font-bold text-stone-800">
            {selectedGroup
              ? `Group: ${selectedGroup.name}`
              : newGroupName
                ? `New group: ${newGroupName}`
                : "Add to group"}
          </Text>
          <Text className="mt-1 text-sm text-stone-500">
            {selectedGroup || newGroupName
              ? "Tap to change or remove"
              : "Optional · Select or create a group"}
          </Text>
        </Pressable>
        {error ? (
          <Text className="mt-3 text-sm font-semibold text-red-600">
            {error}
          </Text>
        ) : null}
        <Pressable
          disabled={isSaving}
          onPress={() => void handleSave()}
          className="mt-7 h-14 items-center justify-center rounded-2xl bg-emerald-700 active:bg-emerald-800 disabled:opacity-60"
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-black text-white">
              Save product
            </Text>
          )}
        </Pressable>
      </ScrollView>
      <GroupPickerModal
        visible={isGroupPickerOpen}
        groups={groups}
        selectedGroupId={groupId}
        pendingGroupName={newGroupName}
        onClose={() => setIsGroupPickerOpen(false)}
        onSelect={(selectedId) => {
          setGroupId(selectedId);
          setNewGroupName(undefined);
        }}
        onCreate={(groupName) => {
          setGroupId(null);
          setNewGroupName(groupName);
        }}
        onClear={() => {
          setGroupId(null);
          setNewGroupName(undefined);
        }}
      />
    </KeyboardAvoidingView>
  );
}
