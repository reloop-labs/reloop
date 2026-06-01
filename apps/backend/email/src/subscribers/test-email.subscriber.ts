import { BusEvent, bus } from "@reloop/bus";
import { sendEmail } from "@reloop/email/utils/email";
import { log } from "evlog";

export async function initTestEmailSubscribers() {
	await bus.subscribe(
		BusEvent.SEND_TEST_EMAIL,
		async (payload) => {
			try {
				log.info({
					message: "Processing SEND_TEST_EMAIL event",
					to: payload.to,
					from: payload.from,
					subject: payload.subject,
				});

				await sendEmail({
					from: payload.from,
					to: payload.to,
					subject: payload.subject,
					html: payload.html,
				});
			} catch (error) {
				log.error({
					...{ error, payload },
					message: "Failed to send test email in subscriber",
				});
			}
		},
		{ queue: "test-email-worker" },
	);
}
