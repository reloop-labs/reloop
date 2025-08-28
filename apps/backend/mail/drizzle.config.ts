import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	driver: "pg",
	dbCredentials: {
		host: process.env.PGHOST || "localhost",
		user: process.env.PGUSER || "postgres",
		password: process.env.PGPASSWORD || "",
		database: process.env.PGDATABASE || "mail_db",
		port: parseInt(process.env.PGPORT || "5432"),
	},
	verbose: true,
	strict: true,
});
