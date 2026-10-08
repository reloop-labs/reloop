export interface DatabaseClientOptions {
	databaseUrl?: string;
	max?: number;
}

export function connectionOptions(
	opts: DatabaseClientOptions = {},
	env: Record<string, string | undefined> = process.env,
) {
	let max = opts.max;
	if (max === undefined && env.PG_POOL_MAX) {
		if (!/^\d+$/.test(env.PG_POOL_MAX)) {
			throw new Error("PG_POOL_MAX must be a positive integer");
		}
		max = Number(env.PG_POOL_MAX);
	}
	if (max !== undefined && (!Number.isSafeInteger(max) || max < 1)) {
		throw new Error("Database pool max must be a positive integer");
	}
	return {
		connectionString:
			opts.databaseUrl ??
			(env.PG_URL || "postgresql://reloop:reloop123@localhost:5432/reloop"),
		max,
	};
}
