import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createProduct,
  deleteProduct,
  getProducts,
  renameProductGroup,
  setProductActive,
  updateProduct,
} from "@/database/products";
import type { Product, ProductFormDraft } from "@/types/product";
import { buildProductGroups } from "@/utils/productGroups";

export function useProductInventory() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const groups = useMemo(() => buildProductGroups(products), [products]);

  const refresh = useCallback(async () => {
    try {
      setProducts(await getProducts(db));
      setError("");
    } catch {
      setError("Could not load your products. Please reopen the app.");
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    // Loading persisted SQLite data is the external-system synchronization for this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (draft: ProductFormDraft) => {
      await createProduct(db, draft);
      await refresh();
    },
    [db, refresh],
  );

  const update = useCallback(
    async (id: number, draft: ProductFormDraft) => {
      await updateProduct(db, id, draft);
      await refresh();
    },
    [db, refresh],
  );

  const toggleVisibility = useCallback(
    async (product: Product) => {
      await setProductActive(db, product.id, !product.isActive);
      await refresh();
    },
    [db, refresh],
  );

  const renameGroup = useCallback(
    async (id: number, name: string) => {
      await renameProductGroup(db, id, name);
      await refresh();
    },
    [db, refresh],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteProduct(db, id);
      await refresh();
    },
    [db, refresh],
  );

  return {
    products,
    groups,
    isLoading,
    error,
    add,
    update,
    renameGroup,
    toggleVisibility,
    remove,
  };
}
