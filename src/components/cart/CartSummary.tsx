import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatPeso } from "@/utils/currency";

type CartSummaryProps = {
  itemCount: number;
  total: number;
  onPress: () => void;
};

export function CartSummary({ itemCount, total, onPress }: CartSummaryProps) {
  const isEmpty = itemCount === 0;
  return (
    <SafeAreaView
      edges={["bottom"]}
      className="absolute bottom-0 left-0 right-0 border-t border-stone-200 bg-white px-5 pt-4"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open payment and calculate change"
        disabled={isEmpty}
        onPress={onPress}
        className={`mb-4 flex-row items-center justify-between rounded-2xl ${
          isEmpty ? "opacity-60" : "active:bg-stone-50"
        }`}
      >
        <View>
          <Text className="text-sm font-medium text-stone-500">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
          <Text className="text-sm font-bold text-stone-700">Total amount</Text>
          {!isEmpty ? (
            <Text className="mt-1 text-xs font-semibold text-emerald-700">
              Tap to calculate change
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center">
          <Text className="text-3xl font-black tracking-tight text-emerald-700">
            {formatPeso(total)}
          </Text>
          {!isEmpty ? <Text className="ml-2 text-2xl text-stone-400">›</Text> : null}
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
