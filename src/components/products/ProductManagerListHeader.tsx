import { Pressable, Text, TextInput, View } from "react-native";

import type { ProductManagerListHeaderProps } from "@/types/components";

export function ProductManagerListHeader({
  search,
  query,
  filter,
  counts,
  onAddProduct,
  onSearchChange,
  onFilterChange,
}: ProductManagerListHeaderProps) {
  return (
    <View>
      <Pressable
        onPress={onAddProduct}
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
          onChangeText={onSearchChange}
          accessibilityLabel="Search individual products"
          placeholder="Find an individual product"
          placeholderTextColor="#A8A29E"
          className="h-12 flex-1 text-base text-stone-900"
        />
        {search ? (
          <Pressable onPress={() => onSearchChange("")} className="p-2">
            <Text className="text-lg text-stone-400">×</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mb-4 flex-row rounded-2xl bg-stone-200 p-1">
        {(
          [
            ["all", "All", counts.all],
            ["shown", "Shown", counts.shown],
            ["hidden", "Hidden", counts.hidden],
          ] as const
        ).map(([value, label, count]) => {
          const isSelected = filter === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onFilterChange(value)}
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

      {query ? (
        <Text className="mb-3 text-sm font-semibold text-stone-500">
          Individual product results
        </Text>
      ) : null}
    </View>
  );
}
