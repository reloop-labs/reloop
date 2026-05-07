import { bus } from "@reloop/bus";
import { logger } from "@reloop/logger";
import { emailConfig } from "../email.config";
import { initSubscribers } from "../subscribers";

export const loader = async () => {
	try {
		await bus.connect(emailConfig.NATS_URL);
		logger.info("NATS connected");

		await initSubscribers();
	} catch (e) {
		logger.error(
			{ error: e instanceof Error ? e.message : String(e) },
			"Error during service initialization",
		);
	}
};
