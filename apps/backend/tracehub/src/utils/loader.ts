import { analyticsClient, checkHealth } from "@reloop/analytics/client";
import { logger } from "@reloop/logger";

export const loader = async () => {
	try {
		const isHealthy = await checkHealth(analyticsClient);
		if (isHealthy) {
			logger.info("tracehub API health check passed");
		} else {
			logger.warn("tracehub API health check failed");
		}
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during tracehub API initialization",
		);
	}
};
