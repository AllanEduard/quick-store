import { Pressable, Text, View } from "react-native";

type AppHeaderProps = {
  onManage: () => void;
};

export function AppHeader({ onManage }: AppHeaderProps) {
  return (
    <View className="mb-6 mt-3 flex-row items-center justify-between">
      <View>
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-emerald-700">
          My tindahan
        </Text>
        <Text className="mt-1 text-3xl font-black tracking-tight text-stone-900">
          Quick Store
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Manage products"
        onPress={onManage}
        className="rounded-2xl border border-stone-300 bg-white px-4 py-3 active:bg-stone-100"
      >
        <Text className="font-bold text-stone-800">Manage</Text>
      </Pressable>
    </View>
  );
}
