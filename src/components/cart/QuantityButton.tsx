import { Pressable, Text } from "react-native";

import type { QuantityButtonProps } from "@/types/components";

export function QuantityButton({ label, onPress }: QuantityButtonProps) {
  return (
    <Pressable
      accessibilityLabel={
        label === "+" ? "Increase quantity" : "Decrease quantity"
      }
      accessibilityRole="button"
      onPress={onPress}
      className="h-9 w-9 items-center justify-center rounded-xl bg-stone-100 active:bg-stone-200"
    >
      <Text className="text-xl font-semibold text-stone-700">{label}</Text>
    </Pressable>
  );
}
