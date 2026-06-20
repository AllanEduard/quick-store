import { Pressable, Text, View } from "react-native";

import type { CartItem } from "@/types/cart";
import { formatPeso } from "@/utils/currency";
import { QuantityButton } from "./QuantityButton";

type CartSectionProps = {
  items: CartItem[];
  onChangeQuantity: (productId: number, change: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
};

export function CartSection({
  items,
  onChangeQuantity,
  onRemove,
  onClear,
}: CartSectionProps) {
  return (
    <View className="mb-7">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-black text-stone-900">Current sale</Text>
        {items.length ? (
          <Pressable onPress={onClear} className="px-2 py-2">
            <Text className="font-semibold text-red-600">Clear all</Text>
          </Pressable>
        ) : null}
      </View>

      {items.length ? (
        <View className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
          {items.map((item, index) => (
            <View
              key={item.product.id}
              className={`p-4 ${index ? "border-t border-stone-100" : ""}`}
            >
              <View className="flex-row justify-between">
                <View className="mr-3 flex-1">
                  <Text className="text-base font-bold text-stone-900">
                    {item.product.name}
                  </Text>
                  <Text className="mt-1 text-sm text-stone-500">
                    {formatPeso(item.product.price)} each
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-black text-stone-900">
                    {formatPeso(item.product.price * item.quantity)}
                  </Text>
                  <Pressable
                    accessibilityLabel={`Remove ${item.product.name} from cart`}
                    onPress={() => onRemove(item.product.id)}
                    className="mt-1 py-1"
                  >
                    <Text className="text-xs font-semibold text-red-600">Remove</Text>
                  </Pressable>
                </View>
              </View>
              <View className="mt-3 flex-row items-center">
                <QuantityButton
                  label="−"
                  onPress={() => onChangeQuantity(item.product.id, -1)}
                />
                <Text className="w-12 text-center text-base font-black text-stone-900">
                  {item.quantity}
                </Text>
                <QuantityButton
                  label="+"
                  onPress={() => onChangeQuantity(item.product.id, 1)}
                />
                <Text className="ml-3 text-sm text-stone-400">quantity</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="items-center rounded-3xl border border-dashed border-stone-300 bg-white px-5 py-9">
          <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-stone-100">
            <Text className="text-xl">🛒</Text>
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className="w-full text-center text-base font-bold text-stone-700"
          >
            Your cart is empty
          </Text>
          <Text className="mt-1 text-center text-sm text-stone-500">
            Tap a product below to start a sale.
          </Text>
        </View>
      )}
    </View>
  );
}
