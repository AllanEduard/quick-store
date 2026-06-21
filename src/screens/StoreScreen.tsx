import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CartSection } from "@/components/cart/CartSection";
import { CartSummary } from "@/components/cart/CartSummary";
import { AppHeader } from "@/components/home/AppHeader";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { ProductManagerModal } from "@/components/products/ProductManagerModal";
import { ProductSearch } from "@/components/products/ProductSearch";
import { useCart } from "@/hooks/useCart";
import { useProductInventory } from "@/hooks/useProductInventory";

export default function StoreScreen() {
  const router = useRouter();
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const inventory = useProductInventory();
  const cart = useCart(inventory.products);

  return (
    <SafeAreaView className="flex-1 bg-[#FBF8F2]" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-44"
      >
        <AppHeader onManage={() => setIsManagerOpen(true)} />
        <ProductSearch
          products={inventory.products}
          getQuantity={cart.getQuantity}
          onAdd={cart.add}
        />
        <CartSection
          items={cart.items}
          onChangeQuantity={cart.changeQuantity}
          onRemove={cart.remove}
          onClear={cart.clear}
        />
        <ProductCatalog
          products={inventory.products}
          isLoading={inventory.isLoading}
          error={inventory.error}
          getQuantity={cart.getQuantity}
          onAdd={cart.add}
        />
      </ScrollView>

      <CartSummary
        itemCount={cart.itemCount}
        total={cart.total}
        onPress={() =>
          router.push({
            pathname: "/payment",
            params: { total: cart.total.toFixed(2) },
          })
        }
      />

      <ProductManagerModal
        visible={isManagerOpen}
        products={inventory.products}
        groups={inventory.groups}
        onClose={() => setIsManagerOpen(false)}
        onCreate={inventory.add}
        onUpdate={inventory.update}
        onRenameGroup={inventory.renameGroup}
        onToggleVisibility={inventory.toggleVisibility}
        onDelete={inventory.remove}
        onProductDeleted={cart.remove}
      />
    </SafeAreaView>
  );
}
