import { bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import { initSubscribers } from "@reloop/email/subscribers";
import { log } from "evlog";

export const loader = async () => {
	try {
		await bus.connect(emailConfig.NATS_URL);
		log.info("server", "NATS connected");

		await initSubscribers();
	} catch (e) {
		log.error({
			error: e instanceof Error ? e.message : String(e),
			message: "Error during service initialization",
		});
	}
};
