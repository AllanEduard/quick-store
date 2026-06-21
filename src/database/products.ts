import type { SQLiteDatabase } from "expo-sqlite";

import { DuplicateGroupError } from "@/errors/inventory";
import type { ProductRow } from "@/types/database";
import type { ProductFormDraft } from "@/types/product";
import {
  assertUniqueProductName,
  createProductGroup,
  deleteGroupIfEmpty,
  mapProduct,
} from "./productHelpers";

export async function getProducts(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<ProductRow>(
    `SELECT p.id, p.name, p.price, p.is_active,
            p.group_id, g.name AS group_name
       FROM products p
       LEFT JOIN product_groups g ON g.id = p.group_id
      ORDER BY CASE WHEN g.name IS NULL THEN 0 ELSE 1 END,
               g.name COLLATE NOCASE, p.name COLLATE NOCASE`,
  );
  return rows.map(mapProduct);
}

export async function createProduct(
  db: SQLiteDatabase,
  { name, price, groupId, newGroupName }: ProductFormDraft,
) {
  await assertUniqueProductName(db, name);
  await db.withTransactionAsync(async () => {
    let destinationGroupId = groupId;
    if (newGroupName) {
      destinationGroupId = await createProductGroup(db, newGroupName);
    }
    await db.runAsync(
      "INSERT INTO products (name, price, is_active, group_id) VALUES (?, ?, 1, ?)",
      name.trim(),
      price,
      destinationGroupId,
    );
  });
}

export async function updateProduct(
  db: SQLiteDatabase,
  id: number,
  { name, price, groupId, newGroupName }: ProductFormDraft,
) {
  await assertUniqueProductName(db, name, id);
  const current = await db.getFirstAsync<{ group_id: number | null }>(
    "SELECT group_id FROM products WHERE id = ?",
    id,
  );
  await db.withTransactionAsync(async () => {
    let destinationGroupId = groupId;
    if (newGroupName) {
      destinationGroupId = await createProductGroup(db, newGroupName);
    }
    await db.runAsync(
      "UPDATE products SET name = ?, price = ?, group_id = ? WHERE id = ?",
      name.trim(),
      price,
      destinationGroupId,
      id,
    );
    if (current?.group_id && current.group_id !== destinationGroupId) {
      await deleteGroupIfEmpty(db, current.group_id);
    }
  });
}

export async function setProductActive(
  db: SQLiteDatabase,
  id: number,
  isActive: boolean,
) {
  await db.runAsync(
    "UPDATE products SET is_active = ? WHERE id = ?",
    isActive ? 1 : 0,
    id,
  );
}

export async function renameProductGroup(
  db: SQLiteDatabase,
  id: number,
  name: string,
) {
  const cleanName = name.trim();
  const duplicate = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM product_groups
      WHERE name = ? COLLATE NOCASE
        AND id != ?`,
    cleanName,
    id,
  );
  if (duplicate) throw new DuplicateGroupError();

  await db.runAsync(
    "UPDATE product_groups SET name = ? WHERE id = ?",
    cleanName,
    id,
  );
}

export async function deleteProduct(db: SQLiteDatabase, id: number) {
  const product = await db.getFirstAsync<{ group_id: number | null }>(
    "SELECT group_id FROM products WHERE id = ?",
    id,
  );
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM products WHERE id = ?", id);
    if (product?.group_id !== null && product?.group_id !== undefined) {
      await deleteGroupIfEmpty(db, product.group_id);
    }
  });
}
