import { bus } from "@reloop/bus";
import { log } from "evlog";

import { emailConfig } from "../email.config";
import { initSubscribers } from "../subscribers";

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
