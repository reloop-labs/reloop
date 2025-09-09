import type { Config } from "drizzle-kit";

export default {
	schema: "./src/schemas/index.ts",
	dialect: "postgresql",
	dbCredentials: { url: process.env.PG_URL! },
	casing: "snake_case",
} satisfies Config;
