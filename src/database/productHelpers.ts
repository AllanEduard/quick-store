import type { SQLiteDatabase } from "expo-sqlite";

import { DuplicateGroupError, DuplicateProductError } from "@/errors/inventory";
import type { ProductRow } from "@/types/database";
import type { Product } from "@/types/product";

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    isActive: row.is_active === 1,
    groupId: row.group_id,
    groupName: row.group_name,
  };
}

export async function assertUniqueProductName(
  db: SQLiteDatabase,
  name: string,
  excludingId?: number,
) {
  const duplicate = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM products
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
        AND (? IS NULL OR id != ?)`,
    name,
    excludingId ?? null,
    excludingId ?? null,
  );
  if (duplicate) throw new DuplicateProductError();
}

export async function createProductGroup(db: SQLiteDatabase, name: string) {
  const cleanName = name.trim();
  const existing = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM product_groups WHERE name = ? COLLATE NOCASE",
    cleanName,
  );
  if (existing) throw new DuplicateGroupError();

  const result = await db.runAsync(
    "INSERT INTO product_groups (name) VALUES (?)",
    cleanName,
  );
  return result.lastInsertRowId;
}

export async function deleteGroupIfEmpty(db: SQLiteDatabase, groupId: number) {
  await db.runAsync(
    `DELETE FROM product_groups
      WHERE id = ? AND NOT EXISTS (
        SELECT 1 FROM products WHERE group_id = ?
      )`,
    groupId,
    groupId,
  );
}
