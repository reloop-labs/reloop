
import { log } from "evlog";
import { initApiKeySubscribers } from "./api-key.subscriber";
import { initAuthSubscribers } from "./auth.subscriber";
import { initBillingSubscribers } from "./billing.subscriber";
import { initDomainSubscribers } from "./domain.subscriber";
import { initOrgSubscribers } from "./organization.subscriber";

export async function initSubscribers() {
	try {
		await Promise.all([
			initAuthSubscribers(),
			initOrgSubscribers(),
			initBillingSubscribers(),
			initDomainSubscribers(),
			initApiKeySubscribers(),
		]);

		log.info("server", "All email subscribers initialized");
	} catch (error) {
		log.error({ error: error instanceof Error ? error.message : String(error) },
			"Failed to initialize email subscribers",
		);
	}
}
