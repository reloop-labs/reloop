import type { Config } from "drizzle-kit";

export default {
	schema: "./src/schema/index.ts",
	dialect: "postgresql",
	out: "./migrations",
	dbCredentials: { url: process.env.PG_URL! },
	casing: "snake_case",
} satisfies Config;
