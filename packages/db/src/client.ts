import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as v from "valibot";

import * as schema from "./schema";

export interface DatabaseClientOptions {
	databaseUrl?: string;
	max?: number;
}

export type DatabaseInstance = NodePgDatabase<typeof schema>;

export const createDb = (opts?: DatabaseClientOptions): DatabaseInstance => {
	return drizzle({
		schema,
		casing: "snake_case",
		connection: {
			connectionString: opts?.databaseUrl,
			max: opts?.max,
		},
	});
};

const envSchema = v.object({
	DB_POSTGRES_URL: v.optional(
		v.string(),
		"postgresql://localhost:5432/postgres",
	),
});

const env = v.parse(envSchema, process.env);

export const db = createDb({
	databaseUrl: env.DB_POSTGRES_URL,
});
