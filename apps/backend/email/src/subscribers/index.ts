import { BusEvent, bus } from "@reloop/bus";
import { logger } from "@reloop/logger";

export async function initSubscribers() {
	try {
		// Example subscription
		await bus.subscribe(
			BusEvent.USER_CREATED,
			async (payload) => {
				logger.info(
					{ email: payload.email },
					"Email service received USER_CREATED event",
				);
				// TODO: Implement email sending logic
			},
			{ queue: "email-service" },
		);

		logger.info("Email subscribers initialized");
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			"Failed to initialize email subscribers",
		);
	}
}
