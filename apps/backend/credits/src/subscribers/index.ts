import { log } from "evlog";
import { initEmailSubscriber } from "./email.subscriber";
import { initInboundSubscriber } from "./inbound.subscriber";
import { initOrganizationSubscriber } from "./organization.subscriber";

export async function initSubscribers() {
	try {
		await Promise.all([
			initOrganizationSubscriber(),
			initEmailSubscriber(),
			initInboundSubscriber(),
		]);
		log.info("server", "Credits subscribers initialized successfully");
	} catch (error) {
		log.error({
			message: "Failed to initialize credits subscribers",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
