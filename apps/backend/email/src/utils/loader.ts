import { bus } from "@reloop/bus";
import { emailConfig } from "@reloop/email/email.config";
import { initSubscribers } from "@reloop/email/subscribers";
import {
	describeEmailTransport,
	resolveEmailTransport,
} from "@reloop/email/utils/email-transport";
import { log } from "evlog";

function reportEmailTransport() {
	try {
		log.info(
			"server",
			`System email transport: ${describeEmailTransport(
				resolveEmailTransport(emailConfig),
			)}`,
		);
	} catch (e) {
		log.error({
			error: e instanceof Error ? e.message : String(e),
			message: "System email is not deliverable",
		});
	}
}

export const loader = async () => {
	reportEmailTransport();

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
