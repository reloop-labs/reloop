import { BusEvent, bus } from "@reloop/bus";
import { logger } from "@reloop/logger";
import { sendEmail } from "../utils/email";
import { emailConfig } from "../email.config";

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
				
				await sendEmail({
					from: `Reloop <onboarding@${emailConfig.RELOOP_SENDER_DOMAIN || "reloop.dev"}>`,
					to: payload.email,
					subject: "Welcome to Reloop!",
					html: `<strong>Hello ${payload.email}!</strong><p>Thanks for joining Reloop.</p>`,
				});
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
