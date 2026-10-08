import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	connectionOptions,
	type DatabaseClientOptions,
} from "./connection-options";
import * as schema from "./schema/index";

export type { DatabaseClientOptions } from "./connection-options";

export type DatabaseInstance = NodePgDatabase<typeof schema>;

export const createDb = (opts?: DatabaseClientOptions): DatabaseInstance => {
	return drizzle({
		schema,
		casing: "snake_case",
		connection: connectionOptions(opts),
	});
};

export const db = createDb();
