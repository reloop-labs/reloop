import { bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";
import { templateConfig } from "../template.config";

export const loader = async () => {
	// Verify database connection
	try {
		await db.execute("SELECT 1");
		logger.info("Database connection verified");
		await bus.connect(templateConfig.NATS_URL);
		logger.info("NATS connected");
	} catch (error) {
		logger.error("Failed to connect to database", { error });
		throw error;
	}

	logger.info("Template service initialized");
};
