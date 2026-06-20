import { Pressable, Text, View } from "react-native";

import type { ProductGroup } from "@/types/product";

type ProductGroupRowProps = {
  group: ProductGroup;
  onPress: () => void;
};

export function ProductGroupRow({ group, onPress }: ProductGroupRowProps) {
  const shownCount = group.products.filter((product) => product.isActive).length;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${group.name} group`}
      onPress={onPress}
      className="mb-2 flex-row items-center rounded-2xl border border-stone-200 bg-white px-4 py-3 active:bg-stone-100"
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
        <Text className="text-base font-black text-emerald-700">
          {group.name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-base font-bold text-stone-900">
          {group.name}
        </Text>
        <Text className="mt-1 text-sm text-stone-500">
          {group.products.length} {group.products.length === 1 ? "product" : "variations"}
          {` · ${shownCount} shown`}
        </Text>
      </View>
      <Text className="text-2xl text-stone-400">›</Text>
    </Pressable>
  );
}
