import { log } from "evlog";
import { bus } from "@reloop/bus";
import { RedisCache } from "@reloop/cache/redis-client";

import { logsConfig } from "../logs.config";
import { ensureTableExists, getClickHouseClient } from "./clickhouse";

export const redis = new RedisCache("logs");

export const loader = async () => {
	try {
		await redis.healthCheck();
		log.info("server", "Redis connected");
		await ensureTableExists();
		const client = getClickHouseClient();
		await client.query({ query: "SELECT 1 as test", format: "JSON" });
		log.info("server", "ClickHouse connection health check passed");
		await bus.connect(logsConfig.NATS_URL);
		log.info("server", "NATS connected");
	} catch (error) {
		log.error({ ...({
				error:
					error instanceof Error
						? {
								message: error.message,
								stack: error.stack,
								name: error.name,
							}
						: error,
			}), message: "Error during initialization" });
	}
};
