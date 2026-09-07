import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import {
	ensurePolarCustomerForOrg,
	getOrProvisionOrgBilling,
} from "@reloop/credits/lib/org-billing";
import {
	livePolarBilling,
	type PolarBillingPort,
} from "@reloop/credits/lib/polar";

export async function createPortalController(args: {
	organizationId: string;
	polar?: PolarBillingPort;
}) {
	const polar = args.polar ?? livePolarBilling;
	if (!polar.enabled) {
		throw CreditErrors.billingDisabled();
	}

	const billing = await getOrProvisionOrgBilling(args.organizationId);
	let customerId = billing.subscription.polarCustomerId;
	if (!customerId) {
		customerId = await ensurePolarCustomerForOrg({
			organizationId: args.organizationId,
			polar,
		});
	}
	if (!customerId) {
		throw CreditErrors.polarCustomerMissing(args.organizationId);
	}

	const portal = await polar.createCustomerPortal({ customerId });
	return { url: portal.url };
}
