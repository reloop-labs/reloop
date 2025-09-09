import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./client";

console.log("Running migrations...");

await migrate(db, {
	migrationsFolder: "./drizzle",
});

console.log("✅ Migrations completed successfully");

process.exit(0);
