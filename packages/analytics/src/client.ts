import { createClient, type ClickHouseClient } from "@clickhouse/client";

export interface ClickHouseClientOptions {
	url?: string;
	username?: string;
	password?: string;
	database?: string;
	maxOpenConnections?: number;
	requestTimeout?: number;
}

export function createClickHouseClient(
	opts?: ClickHouseClientOptions,
): ClickHouseClient {
	const url = opts?.url || process.env.CLICKHOUSE_URL || "http://localhost:8123";
	const username = opts?.username || process.env.CLICKHOUSE_USER || "reloop";
	const password =
		opts?.password || process.env.CLICKHOUSE_PASSWORD || "reloop123";
	const database =
		opts?.database || process.env.CLICKHOUSE_DATABASE || "reloop_analytics";

	return createClient({
		url,
		username,
		password,
		database,
		max_open_connections: opts?.maxOpenConnections || 10,
		request_timeout: opts?.requestTimeout || 30000,
	});
}

export const clickHouseClient = createClickHouseClient();

export async function checkHealth(
	client: ClickHouseClient = clickHouseClient,
): Promise<boolean> {
	try {
		await client.ping();
		return true;
	} catch {
		return false;
	}
}

export type { ClickHouseClient };

