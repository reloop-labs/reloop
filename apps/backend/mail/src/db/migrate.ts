import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { table } from "./schema";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
  });

  const db = drizzle(pool, { schema: table });

  console.log("🔄 Running Drizzle migrations...");

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});