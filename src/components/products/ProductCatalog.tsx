import { ActivityIndicator, Text, View } from "react-native";

import type { ProductCatalogProps } from "@/types/components";
import { ProductCard } from "./ProductCard";

export function ProductCatalog({
  products,
  isLoading,
  error,
  getQuantity,
  onAdd,
}: ProductCatalogProps) {
  const availableProducts = products.filter((product) => product.isActive);

  return (
    <>
      <View className="mb-3 flex-row items-end justify-between">
        <View>
          <Text className="text-2xl font-black text-stone-900">Products</Text>
          <Text className="mt-1 text-sm text-stone-500">
            Tap an item to add it
          </Text>
        </View>
        <Text className="text-sm font-semibold text-stone-500">
          {availableProducts.length} available
        </Text>
      </View>

      {isLoading ? (
        <View className="h-40 items-center justify-center">
          <ActivityIndicator color="#047857" />
        </View>
      ) : error ? (
        <View className="rounded-2xl bg-red-50 p-4">
          <Text className="text-red-700">{error}</Text>
        </View>
      ) : availableProducts.length ? (
        <View className="flex-row flex-wrap justify-between">
          {availableProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getQuantity(product.id)}
              onPress={() => onAdd(product.id)}
            />
          ))}
        </View>
      ) : (
        <View className="items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-10">
          <Text className="text-lg font-bold text-stone-700">
            No products listed
          </Text>
          <Text className="mt-1 text-center text-stone-500">
            Add products using the Manage button.
          </Text>
        </View>
      )}
    </>
  );
}
