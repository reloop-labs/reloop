import { logger } from "@reloop/logger";
import { ensureTableExists, getClickHouseClient } from "./clickhouse";

export const loader = async () => {
	try {
		// Ensure ClickHouse table exists
		await ensureTableExists();

		// Check ClickHouse connection health
		const client = getClickHouseClient();
		await client.query({
			query: "SELECT 1 as test",
			format: "JSON",
		});

		logger.info("ClickHouse connection health check passed");
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during ClickHouse initialization",
		);
	}
};
