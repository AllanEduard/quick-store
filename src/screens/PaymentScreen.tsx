import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCartContext } from "@/contexts/CartContext";
import { formatPeso } from "@/utils/currency";

export default function PaymentScreen() {
  const router = useRouter();
  const { clear } = useCartContext();
  const params = useLocalSearchParams<{ total?: string | string[] }>();
  const totalParam = Array.isArray(params.total) ? params.total[0] : params.total;
  const total = Math.max(0, Number(totalParam) || 0);
  const [cash, setCash] = useState("");
  const cashAmount = useMemo(() => {
    const value = cash.trim().replace(",", ".");
    if (!value) return null;
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? amount : null;
  }, [cash]);
  const difference = cashAmount === null ? null : cashAmount - total;

  return (
    <SafeAreaView className="flex-1 bg-[#FBF8F2]">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center border-b border-stone-200 bg-white px-5 py-4">
          <Pressable onPress={() => router.back()} className="mr-4 py-2 pr-2">
            <Text className="text-base font-bold text-stone-600">‹ Back</Text>
          </Pressable>
          <Text className="text-xl font-black text-stone-900">Payment</Text>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-5 py-7">
          <View className="items-center rounded-3xl bg-emerald-700 px-5 py-7">
            <Text className="text-sm font-bold uppercase tracking-widest text-emerald-100">
              Amount due
            </Text>
            <Text className="mt-2 text-4xl font-black tracking-tight text-white">
              {formatPeso(total)}
            </Text>
          </View>

          <Text className="mb-2 mt-7 text-sm font-bold text-stone-700">
            Customer&apos;s cash
          </Text>
          <View className="flex-row items-center rounded-2xl border border-stone-300 bg-white px-4">
            <Text className="mr-2 text-2xl font-black text-stone-500">₱</Text>
            <TextInput
              autoFocus
              value={cash}
              onChangeText={setCash}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#A8A29E"
              className="h-16 flex-1 text-2xl font-bold text-stone-900"
            />
          </View>
          <Pressable
            onPress={() => setCash(total.toFixed(2))}
            className="mt-3 self-start rounded-xl bg-stone-200 px-4 py-2"
          >
            <Text className="font-bold text-stone-700">Exact amount</Text>
          </Pressable>

          {difference !== null ? (
            <>
              <View
                className={`mt-7 items-center rounded-3xl border px-5 py-7 ${
                  difference >= 0
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <Text
                  className={`text-sm font-bold uppercase tracking-widest ${
                    difference >= 0 ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {difference >= 0 ? "Customer change" : "Amount still needed"}
                </Text>
                <Text
                  className={`mt-2 text-4xl font-black tracking-tight ${
                    difference >= 0 ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {formatPeso(Math.abs(difference))}
                </Text>
              </View>
              {difference >= 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    clear();
                    router.back();
                  }}
                  className="mt-5 h-14 items-center justify-center rounded-2xl bg-emerald-700 active:bg-emerald-800"
                >
                  <Text className="text-base font-black text-white">Done</Text>
                </Pressable>
              ) : null}
            </>
          ) : cash ? (
            <Text className="mt-3 text-sm font-semibold text-red-600">
              Enter a valid cash amount.
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
