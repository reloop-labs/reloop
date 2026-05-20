import { log } from "evlog";
import { initApiKeySubscribers } from "@reloop/email/subscribers/api-key.subscriber";
import { initAuthSubscribers } from "@reloop/email/subscribers/auth.subscriber";
import { initBillingSubscribers } from "@reloop/email/subscribers/billing.subscriber";
import { initDomainSubscribers } from "@reloop/email/subscribers/domain.subscriber";
import { initOrgSubscribers } from "@reloop/email/subscribers/organization.subscriber";

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
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize email subscribers",
		});
	}
}
