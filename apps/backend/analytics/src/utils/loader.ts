import { analyticsClient, checkHealth } from "@reloop/analytics/client";
import { logger } from "@reloop/logger";

export const loader = async () => {
	try {
		const isHealthy = await checkHealth(analyticsClient);
		if (isHealthy) {
			logger.info("Analytics API health check passed");
		} else {
			logger.warn("Analytics API health check failed");
		}
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during analytics API initialization",
		);
	}
};
