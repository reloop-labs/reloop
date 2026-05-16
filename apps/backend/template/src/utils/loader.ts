import { log } from "evlog";
import { bus } from "@reloop/bus";
import { db } from "@reloop/db/client";

import { templateConfig } from "../template.config";

export const loader = async () => {
	// Verify database connection
	try {
		await db.execute("SELECT 1");
		log.info("server", "Database connection verified");
		await bus.connect(templateConfig.NATS_URL);
		log.info("server", "NATS connected");
	} catch (error) {
		log.error({ ...({ error }), message: "Failed to connect to database" });
		throw error;
	}

	log.info("server", "Template service initialized");
};
