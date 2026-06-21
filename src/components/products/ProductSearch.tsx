import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import type { ProductSearchProps } from "@/types/components";
import { formatPeso } from "@/utils/currency";
import { searchActiveProducts } from "@/utils/productSearch";

export function ProductSearch({
  products,
  getQuantity,
  onAdd,
}: ProductSearchProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const results = useMemo(
    () => searchActiveProducts(products, query),
    [products, query],
  );

  return (
    <View className="mb-6">
      <View className="flex-row items-center rounded-2xl border border-stone-200 bg-white px-4">
        <Text className="mr-3 text-lg text-stone-400">⌕</Text>
        <TextInput
          accessibilityLabel="Search products"
          value={search}
          onChangeText={setSearch}
          placeholder="Search products"
          placeholderTextColor="#A8A29E"
          className="h-14 flex-1 text-base text-stone-900"
        />
        {search ? (
          <Pressable onPress={() => setSearch("")} className="p-2">
            <Text className="text-lg text-stone-400">×</Text>
          </Pressable>
        ) : null}
      </View>

      {query ? (
        results.length ? (
          <View className="mt-3">
            <Text className="mb-2 text-sm font-semibold text-stone-500">
              {results.length} {results.length === 1 ? "result" : "results"}
            </Text>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
            >
              {results.map((product) => {
                const quantity = getQuantity(product.id);
                return (
                  <Pressable
                    key={product.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${product.name} to cart`}
                    onPress={() => onAdd(product.id)}
                    className="mr-3 w-44 rounded-2xl border border-stone-200 bg-white p-3 active:bg-orange-50"
                  >
                    <View className="flex-row items-start justify-between">
                      <Text
                        numberOfLines={1}
                        className="mr-2 flex-1 font-bold text-stone-900"
                      >
                        {product.name}
                      </Text>
                      {quantity > 0 ? (
                        <View className="rounded-full bg-emerald-600 px-2 py-0.5">
                          <Text className="text-xs font-bold text-white">
                            {quantity}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View className="mt-3 flex-row items-center justify-between">
                      <Text className="font-extrabold text-emerald-700">
                        {formatPeso(product.price)}
                      </Text>
                      <View className="h-7 w-7 items-center justify-center rounded-full bg-stone-900">
                        <Text className="text-lg leading-5 text-white">+</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <Text className="mt-3 text-center text-sm text-stone-500">
            No matching products.
          </Text>
        )
      ) : null}
    </View>
  );
}
