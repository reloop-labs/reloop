import { initApiKeySubscribers } from "@reloop/email/subscribers/api-key.subscriber";
import { initAuthSubscribers } from "@reloop/email/subscribers/auth.subscriber";
import { initBillingSubscribers } from "@reloop/email/subscribers/billing.subscriber";
import { initDomainSubscribers } from "@reloop/email/subscribers/domain.subscriber";
import { initOrgSubscribers } from "@reloop/email/subscribers/organization.subscriber";
import { initSignupInviteSubscribers } from "@reloop/email/subscribers/signup-invite.subscriber";
import { initTestEmailSubscribers } from "@reloop/email/subscribers/test-email.subscriber";
import { log } from "evlog";

export async function initSubscribers() {
	try {
		await Promise.all([
			initAuthSubscribers(),
			initOrgSubscribers(),
			initSignupInviteSubscribers(),
			initBillingSubscribers(),
			initDomainSubscribers(),
			initApiKeySubscribers(),
			initTestEmailSubscribers(),
		]);

		log.info("server", "All email subscribers initialized");
	} catch (error) {
		log.error({
			error: error instanceof Error ? error.message : String(error),
			message: "Failed to initialize email subscribers",
		});
	}
}
