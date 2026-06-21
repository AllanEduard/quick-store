import { Pressable, Text, View } from "react-native";

import type { ManagedProductRowProps } from "@/types/components";
import { formatPeso } from "@/utils/currency";

export function ManagedProductRow({
  product,
  showGroup = false,
  onEdit,
  onActions,
}: ManagedProductRowProps) {
  return (
    <View
      className={`mb-2 flex-row items-center rounded-2xl border border-stone-200 bg-white pl-4 pr-2 ${
        product.isActive ? "" : "opacity-60"
      }`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${product.name}`}
        onPress={onEdit}
        className="flex-1 py-3"
      >
        <Text numberOfLines={1} className="text-base font-bold text-stone-900">
          {product.name}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-emerald-700">
          {formatPeso(product.price)}
          {!product.isActive ? "  ·  Hidden" : ""}
          {showGroup ? `  ·  ${product.groupName ?? "Ungrouped"}` : ""}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`More actions for ${product.name}`}
        onPress={onActions}
        className="h-11 w-11 items-center justify-center rounded-xl active:bg-stone-100"
      >
        <Text className="text-lg font-black tracking-widest text-stone-500">
          •••
        </Text>
      </Pressable>
    </View>
  );
}
