import { checkHealth } from "@reloop/analytics/client";
import { clickHouseClient } from "@reloop/analytics/client";
import { logger } from "@reloop/logger";

export const loader = async () => {
	try {
		const isHealthy = await checkHealth(clickHouseClient);
		if (isHealthy) {
			logger.info("ClickHouse connected");
		} else {
			logger.warn("ClickHouse health check failed");
		}
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during ClickHouse initialization",
		);
	}
};

