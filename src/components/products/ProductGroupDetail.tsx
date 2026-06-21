import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import type { ProductGroupDetailProps } from "@/types/components";
import { ManagedProductRow } from "./ManagedProductRow";

export function ProductGroupDetail({
  group,
  products,
  nameDraft,
  nameError,
  isSavingName,
  onBack,
  onStartRename,
  onNameChange,
  onSaveName,
  onCancelRename,
  onAddVariation,
  onEditProduct,
  onProductActions,
}: ProductGroupDetailProps) {
  return (
    <>
      <View className="flex-row items-center border-b border-stone-200 bg-white px-5 py-4">
        <Pressable onPress={onBack} className="mr-4 py-2 pr-2">
          <Text className="text-base font-bold text-stone-600">‹ Back</Text>
        </Pressable>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-xl font-black text-stone-900">
            {group.name}
          </Text>
          <Text className="mt-1 text-sm text-stone-500">
            {group.products.length} variations
          </Text>
        </View>
        {nameDraft === null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${group.name} group name`}
            onPress={onStartRename}
            className="ml-3 rounded-xl bg-emerald-50 px-4 py-2.5 active:bg-emerald-100"
          >
            <Text className="font-bold text-emerald-700">Edit</Text>
          </Pressable>
        ) : null}
      </View>

      {nameDraft !== null ? (
        <View className="border-b border-stone-200 bg-white px-5 pb-5">
          <Text className="mb-2 text-sm font-bold text-stone-700">
            Group name
          </Text>
          <TextInput
            autoFocus
            value={nameDraft}
            onChangeText={onNameChange}
            onSubmitEditing={onSaveName}
            accessibilityLabel="Group name"
            returnKeyType="done"
            selectTextOnFocus
            className="h-12 rounded-xl border border-stone-300 bg-stone-50 px-4 text-base text-stone-900"
          />
          {nameError ? (
            <Text className="mt-2 text-sm font-semibold text-red-600">
              {nameError}
            </Text>
          ) : null}
          <View className="mt-3 flex-row justify-end">
            <Pressable
              disabled={isSavingName}
              onPress={onCancelRename}
              className="mr-2 rounded-xl px-4 py-2.5"
            >
              <Text className="font-bold text-stone-600">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={isSavingName}
              onPress={onSaveName}
              className={`rounded-xl px-5 py-2.5 ${
                isSavingName
                  ? "bg-emerald-400"
                  : "bg-emerald-700 active:bg-emerald-800"
              }`}
            >
              <Text className="font-bold text-white">
                {isSavingName ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(product) => String(product.id)}
        contentContainerClassName="px-5 pb-8 pt-5"
        ListHeaderComponent={
          <Pressable
            onPress={onAddVariation}
            className="mb-4 h-14 flex-row items-center justify-center rounded-2xl bg-emerald-700 active:bg-emerald-800"
          >
            <Text className="mr-2 text-xl text-white">+</Text>
            <Text className="text-base font-black text-white">
              Add variation
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <ManagedProductRow
            product={item}
            onEdit={() => onEditProduct(item)}
            onActions={() => onProductActions(item)}
          />
        )}
      />
    </>
  );
}
