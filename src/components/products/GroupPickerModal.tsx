import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { GroupPickerModalProps } from "@/types/components";
import {
  filterGroupsByName,
  validateNewGroupName,
} from "@/utils/productGroups";

export function GroupPickerModal({
  visible,
  groups,
  selectedGroupId,
  pendingGroupName,
  onClose,
  onSelect,
  onCreate,
  onClear,
}: GroupPickerModalProps) {
  const [search, setSearch] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const filteredGroups = useMemo(
    () => filterGroupsByName(groups, search),
    [groups, search],
  );

  const close = () => {
    setSearch("");
    setNewGroupName("");
    setError("");
    onClose();
  };

  const create = () => {
    const cleanName = newGroupName.trim();
    const validationError = validateNewGroupName(cleanName, groups);
    if (validationError) return setError(validationError);
    onCreate(cleanName);
    close();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView className="flex-1 bg-[#FBF8F2]">
        <View className="flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
          <View>
            <Text className="text-xl font-black text-stone-900">
              Add to group
            </Text>
            <Text className="mt-1 text-sm text-stone-500">Optional</Text>
          </View>
          <Pressable onPress={close} className="p-3">
            <Text className="text-2xl text-stone-500">×</Text>
          </Pressable>
        </View>

        <FlatList
          data={filteredGroups}
          keyExtractor={(group) => String(group.id)}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-5 pb-8 pt-5"
          ListHeaderComponent={
            <View>
              <Text className="mb-2 text-sm font-bold text-stone-700">
                Create new group
              </Text>
              <View className="mb-2 flex-row">
                <TextInput
                  value={newGroupName}
                  onChangeText={(value) => {
                    setNewGroupName(value);
                    setError("");
                  }}
                  placeholder="e.g. Coke"
                  placeholderTextColor="#A8A29E"
                  className="mr-2 h-12 flex-1 rounded-2xl border border-stone-300 bg-white px-4 text-stone-900"
                />
                <Pressable
                  onPress={create}
                  className="h-12 items-center justify-center rounded-2xl bg-emerald-700 px-5"
                >
                  <Text className="font-black text-white">Create</Text>
                </Pressable>
              </View>
              {error ? (
                <Text className="mb-3 text-sm text-red-600">{error}</Text>
              ) : null}

              {selectedGroupId !== null || pendingGroupName ? (
                <Pressable
                  onPress={() => {
                    onClear();
                    close();
                  }}
                  className="mb-4 rounded-2xl border border-stone-300 bg-white px-4 py-3"
                >
                  <Text className="text-center font-bold text-stone-700">
                    Remove from group
                  </Text>
                </Pressable>
              ) : null}

              <View className="mb-3 flex-row items-center rounded-2xl border border-stone-200 bg-white px-4">
                <Text className="mr-3 text-lg text-stone-400">⌕</Text>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search existing groups"
                  placeholderTextColor="#A8A29E"
                  className="h-12 flex-1 text-stone-900"
                />
              </View>
              <Text className="mb-2 text-sm font-bold text-stone-700">
                Existing groups
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text className="py-5 text-center text-stone-500">
              {search ? "No matching groups." : "No groups created yet."}
            </Text>
          }
          renderItem={({ item }) => {
            const selected = selectedGroupId === item.id;
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.id);
                  close();
                }}
                className={`mb-2 flex-row items-center rounded-2xl border px-4 py-3 ${
                  selected
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-stone-200 bg-white"
                }`}
              >
                <Text className="flex-1 font-bold text-stone-900">
                  {item.name}
                </Text>
                <Text className="text-sm text-stone-500">
                  {item.products.length}{" "}
                  {item.products.length === 1 ? "product" : "products"}
                </Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}
