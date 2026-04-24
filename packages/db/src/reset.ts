import { $ } from "bun";
import { Client } from "pg";

async function resetDb() {
  const pgUrl = process.env.PG_URL;

  if (!pgUrl) {
    throw new Error("PG_URL environment variable is not set.");
  }

  const url = new URL(pgUrl);
  const dbName = url.pathname.slice(1);

  // Use 'template1' for maintenance if the target database is 'postgres'
  const maintenanceDb = dbName === "postgres" ? "template1" : "postgres";
  const maintenanceUrl = new URL(pgUrl);
  maintenanceUrl.pathname = `/${maintenanceDb}`;

  console.log(`🚀 Resetting database: ${dbName}...`);

  const client = new Client({
    connectionString: maintenanceUrl.toString(),
  });

  try {
    await client.connect();

    // Terminate all connections to the database we want to drop
    console.log(`🔌 Terminating connections to ${dbName}...`);
    await client.query(
      `
			SELECT pg_terminate_backend(pg_stat_activity.pid)
			FROM pg_stat_activity
			WHERE pg_stat_activity.datname = $1
			AND pid <> pg_backend_pid();
		`,
      [dbName],
    );

    // Drop the database
    console.log(`🗑️  Dropping database ${dbName}...`);
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);

    // Create the database
    console.log(`✨ Creating database ${dbName}...`);
    await client.query(`CREATE DATABASE "${dbName}"`);

    console.log(`✅ Database ${dbName} reset successfully.`);
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Run migrations
  console.log("🏗️  Running migrations...");
  try {
    await $`bun env:run drizzle-kit migrate`.text();
    console.log("✅ Migrations completed.");
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    process.exit(1);
  }

  // Run seeds
  console.log("🌱 Running seeds...");
  try {
    await $`bun db:seed`.text();
    console.log("✅ Seeding completed.");
  } catch (error) {
    console.error("❌ Error running seeds:", error);
    process.exit(1);
  }

  console.log("\n🎊 Database reset, migrated, and seeded successfully!");
}

resetDb();
