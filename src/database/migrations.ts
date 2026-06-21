import type { SQLiteDatabase } from "expo-sqlite";

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

async function migrateToVersion1(db: SQLiteDatabase) {
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

async function migrateToVersion2(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ name: string; price: number }>(
    "SELECT name, price FROM products",
  );
  const isUntouchedDemoInventory =
    rows.length === legacyStarterProducts.length &&
    legacyStarterProducts.every(([name, price]) =>
      rows.some((row) => row.name === name && row.price === price),
    );

  await db.withTransactionAsync(async () => {
    if (isUntouchedDemoInventory) await db.runAsync("DELETE FROM products");
    await db.execAsync("PRAGMA user_version = 2");
  });
}

async function migrateToVersion3(db: SQLiteDatabase) {
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

    const products = await db.getAllAsync<{ id: number; name: string }>(
      "SELECT id, name FROM products",
    );
    for (const product of products) {
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

async function migrateToVersion4(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    // Undo automatic one-product grouping while preserving intentional groups.
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

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = version?.user_version ?? 0;

  if (currentVersion < 1) await migrateToVersion1(db);
  if (currentVersion < 2) await migrateToVersion2(db);
  if (currentVersion < 3) await migrateToVersion3(db);
  if (currentVersion < 4) await migrateToVersion4(db);
}
