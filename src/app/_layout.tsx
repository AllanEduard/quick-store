import "../global.css";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { initializeDatabase } from "@/database/migrations";
import { CartProvider } from "@/contexts/CartContext";

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="tindahan.db" onInit={initializeDatabase}>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </CartProvider>
    </SQLiteProvider>
  );
}
