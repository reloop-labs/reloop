import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";
import { logger } from "@reloop/logger";
import { logsConfig } from "../logs.config";
import { ensureTableExists, getClickHouseClient } from "./clickhouse";

export const redis = new RedisCache("logs");

export const loader = async () => {
	try {
		await redis.healthCheck();
		logger.info("Redis connected");
		await ensureTableExists();
		const client = getClickHouseClient();
		await client.query({ query: "SELECT 1 as test", format: "JSON" });
		logger.info("ClickHouse connection health check passed");
		await bus.connect(logsConfig.NATS_URL);
		logger.info("NATS connected");
	} catch (error) {
		logger.error(
			{
				error:
					error instanceof Error
						? {
								message: error.message,
								stack: error.stack,
								name: error.name,
							}
						: error,
			},
			"Error during initialization",
		);
	}
};
