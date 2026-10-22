import { initApiKeySubscribers } from "@reloop/email/subscribers/api-key.subscriber";
import { initAuthSubscribers } from "@reloop/email/subscribers/auth.subscriber";
import { initBillingSubscribers } from "@reloop/email/subscribers/billing.subscriber";
import { initDedicatedIpSubscribers } from "@reloop/email/subscribers/dedicated-ip.subscriber";
import { initDomainSubscribers } from "@reloop/email/subscribers/domain.subscriber";
import { initExportSubscribers } from "@reloop/email/subscribers/export.subscriber";
import { initOrgSubscribers } from "@reloop/email/subscribers/organization.subscriber";
import { initReputationSubscribers } from "@reloop/email/subscribers/reputation.subscriber";
import { initStartupSubscribers } from "@reloop/email/subscribers/startup.subscriber";
import { initTestEmailSubscribers } from "@reloop/email/subscribers/test-email.subscriber";
import { log } from "evlog";

export async function initSubscribers() {
	try {
		await Promise.all([
			initAuthSubscribers(),
			initOrgSubscribers(),
			initBillingSubscribers(),
			initDomainSubscribers(),
			initApiKeySubscribers(),
			initTestEmailSubscribers(),
			initExportSubscribers(),
			initStartupSubscribers(),
			initDedicatedIpSubscribers(),
			initReputationSubscribers(),
		]);

		log.info("server", "All email subscribers initialized");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize email subscribers",
		});
	}
}
