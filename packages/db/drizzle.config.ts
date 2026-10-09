import type { Config } from "drizzle-kit";

export default {
	schema: "./src/schema/index.ts",
	dialect: "postgresql",
	schemaFilter: ["public"],
	out: "./migrations",
	dbCredentials: {
		url: process.env.PG_MIGRATION_URL || process.env.PG_URL || "",
	},
	casing: "snake_case",
} satisfies Config;
