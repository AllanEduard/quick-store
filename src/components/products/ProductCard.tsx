import { Pressable, Text, View } from "react-native";

import { productCardColors } from "@/constants/productStyles";
import type { ProductCardProps } from "@/types/components";
import { formatPeso } from "@/utils/currency";

export function ProductCard({ product, quantity, onPress }: ProductCardProps) {
  return (
    <Pressable
      accessibilityLabel={`Add ${product.name} to cart`}
      accessibilityRole="button"
      onPress={onPress}
      className="mb-3 w-[48.5%] rounded-3xl border border-stone-200 bg-white p-4 active:scale-[0.98] active:bg-orange-50"
    >
      <View className="mb-5 flex-row items-start justify-between">
        <View
          className={`h-11 w-11 items-center justify-center rounded-2xl ${
            productCardColors[product.id % productCardColors.length]
          }`}
        >
          <Text className="text-lg font-black text-stone-700">
            {product.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        {quantity > 0 ? (
          <View className="min-w-7 items-center rounded-full bg-emerald-600 px-2 py-1">
            <Text className="text-xs font-bold text-white">{quantity}</Text>
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={2}
        className="min-h-10 text-base font-bold text-stone-900"
      >
        {product.name}
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-base font-extrabold text-emerald-700">
          {formatPeso(product.price)}
        </Text>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-stone-900">
          <Text className="text-xl font-light leading-6 text-white">+</Text>
        </View>
      </View>
    </Pressable>
  );
}
