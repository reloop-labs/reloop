import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";

export const loader = async () => {
	// Verify database connection
	try {
		await db.execute("SELECT 1");
		logger.info("Database connection verified");
	} catch (error) {
		logger.error("Failed to connect to database", { error });
		throw error;
	}

	logger.info("Template service initialized");
};
