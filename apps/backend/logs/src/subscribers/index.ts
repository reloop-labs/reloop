import { log } from "evlog";
import { initApiKeySubscribers } from "./api-key.subscriber";
import { initAuthSubscribers } from "./auth.subscriber";
import { initBillingSubscribers } from "./billing.subscriber";
import { initDomainSubscribers } from "./domain.subscriber";
import { initEmailSubscribers } from "./email.subscriber";

export async function initSubscribers() {
	try {
		await Promise.all([
			initApiKeySubscribers(),
			initDomainSubscribers(),
			initEmailSubscribers(),
			initAuthSubscribers(),
			initBillingSubscribers(),
		]);

		log.info("server", "All audit log subscribers initialized");
	} catch (error) {
		log.error({
			message: "Failed to initialize audit log subscribers",
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
