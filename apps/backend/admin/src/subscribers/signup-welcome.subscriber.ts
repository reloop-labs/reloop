import { sendSignupWelcomeSupportMessage } from "@reloop/admin/services/support/send-signup-welcome";
import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";

export async function initSignupWelcomeSubscriber() {
	try {
		await bus.subscribe(
			BusEvent.USER_CREATED,
			async (payload) => {
				try {
					await sendSignupWelcomeSupportMessage(payload.id);
				} catch (err) {
					log.error({
						error: err instanceof Error ? err.message : String(err),
						userId: payload.id,
						email: payload.email,
						message:
							"Failed to send signup welcome support message for USER_CREATED",
					});
				}
			},
			{ queue: "admin-support-welcome-worker" },
		);

		log.info("server", "Signup welcome support subscriber registered");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize signup welcome support subscriber",
		});
	}
}
