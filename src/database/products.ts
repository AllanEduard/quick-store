import type { SQLiteDatabase } from "expo-sqlite";

import { DuplicateGroupError, DuplicateProductError } from "@/errors/inventory";
import type { Product, ProductFormDraft } from "@/types/product";

type ProductRow = {
  id: number;
  name: string;
  price: number;
  is_active: number;
  group_id: number | null;
  group_name: string | null;
};

// Used only to recognize and remove the original untouched demo inventory.
const legacyStarterProducts = [
  ["Coke Sakto", 15],
  ["Piattos", 18],
  ["Itlog", 10],
  ["Pancit Canton", 16],
  ["Kopiko 3-in-1", 9],
  ["Gardenia Tinapay", 8],
  ["Mineral Water", 12],
  ["Sardinas", 24],
] as const;

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    isActive: row.is_active === 1,
    groupId: row.group_id,
    groupName: row.group_name,
  };
}

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );

  if ((version?.user_version ?? 0) < 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL CHECK (price >= 0),
          is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.execAsync("PRAGMA user_version = 1");
    });
  }

  if ((version?.user_version ?? 0) < 2) {
    const rows = await db.getAllAsync<{ name: string; price: number }>(
      "SELECT name, price FROM products",
    );
    const isUntouchedDemoInventory =
      rows.length === legacyStarterProducts.length &&
      legacyStarterProducts.every(([name, price]) =>
        rows.some((row) => row.name === name && row.price === price),
      );

    await db.withTransactionAsync(async () => {
      if (isUntouchedDemoInventory) {
        await db.runAsync("DELETE FROM products");
      }
      await db.execAsync("PRAGMA user_version = 2");
    });
  }

  if ((version?.user_version ?? 0) < 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS product_groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL COLLATE NOCASE UNIQUE,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        ALTER TABLE products ADD COLUMN group_id INTEGER
          REFERENCES product_groups(id) ON DELETE CASCADE;
      `);

      const existingProducts = await db.getAllAsync<{ id: number; name: string }>(
        "SELECT id, name FROM products",
      );
      for (const product of existingProducts) {
        await db.runAsync(
          "INSERT OR IGNORE INTO product_groups (name) VALUES (?)",
          product.name.trim(),
        );
        const group = await db.getFirstAsync<{ id: number }>(
          "SELECT id FROM product_groups WHERE name = ? COLLATE NOCASE",
          product.name.trim(),
        );
        if (group) {
          await db.runAsync(
            "UPDATE products SET group_id = ? WHERE id = ?",
            group.id,
            product.id,
          );
        }
      }

      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS products_group_id_idx ON products(group_id);
        PRAGMA user_version = 3;
      `);
    });
  }

  if ((version?.user_version ?? 0) < 4) {
    await db.withTransactionAsync(async () => {
      // Undo the previous automatic one-product grouping while preserving real
      // groups that contain variations or have a distinct group name.
      await db.execAsync(`
        UPDATE products
           SET group_id = NULL
         WHERE group_id IN (
           SELECT g.id
             FROM product_groups g
             JOIN products p ON p.group_id = g.id
            GROUP BY g.id, g.name
           HAVING COUNT(p.id) = 1
              AND LOWER(TRIM(g.name)) = LOWER(TRIM(MAX(p.name)))
         );
        DELETE FROM product_groups
         WHERE NOT EXISTS (
           SELECT 1 FROM products WHERE products.group_id = product_groups.id
         );
        PRAGMA user_version = 4;
      `);
    });
  }
}

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

async function assertUniqueProductName(
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

export async function createProduct(
  db: SQLiteDatabase,
  { name, price, groupId, newGroupName }: ProductFormDraft,
) {
  await assertUniqueProductName(db, name);
  await db.withTransactionAsync(async () => {
    let destinationGroupId = groupId;
    if (newGroupName) {
      const existingGroup = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM product_groups WHERE name = ? COLLATE NOCASE",
        newGroupName.trim(),
      );
      if (existingGroup) throw new DuplicateGroupError();
      const result = await db.runAsync(
        "INSERT INTO product_groups (name) VALUES (?)",
        newGroupName.trim(),
      );
      destinationGroupId = result.lastInsertRowId;
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
      const existingGroup = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM product_groups WHERE name = ? COLLATE NOCASE",
        newGroupName.trim(),
      );
      if (existingGroup) throw new DuplicateGroupError();
      const result = await db.runAsync(
        "INSERT INTO product_groups (name) VALUES (?)",
        newGroupName.trim(),
      );
      destinationGroupId = result.lastInsertRowId;
    }
    await db.runAsync(
      "UPDATE products SET name = ?, price = ?, group_id = ? WHERE id = ?",
      name.trim(),
      price,
      destinationGroupId,
      id,
    );
    if (current?.group_id && current.group_id !== destinationGroupId) {
      await db.runAsync(
        `DELETE FROM product_groups
          WHERE id = ? AND NOT EXISTS (
            SELECT 1 FROM products WHERE group_id = ?
          )`,
        current.group_id,
        current.group_id,
      );
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

export async function deleteProduct(db: SQLiteDatabase, id: number) {
  const product = await db.getFirstAsync<{ group_id: number | null }>(
    "SELECT group_id FROM products WHERE id = ?",
    id,
  );
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM products WHERE id = ?", id);
    if (product?.group_id !== null && product?.group_id !== undefined) {
      await db.runAsync(
        `DELETE FROM product_groups
          WHERE id = ? AND NOT EXISTS (
            SELECT 1 FROM products WHERE group_id = ?
          )`,
        product.group_id,
        product.group_id,
      );
    }
  });
}
