import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schemas/index";

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

export const db = createDb({
	databaseUrl: process.env.PG_DATABASE_URL!,
});
