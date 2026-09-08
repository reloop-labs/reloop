import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { ensurePolarCustomerForOrg } from "@reloop/credits/lib/org-billing";
import {
	isPolarMissingCustomerError,
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

	const customerId = await ensurePolarCustomerForOrg({
		organizationId: args.organizationId,
		polar,
	});
	if (!customerId) {
		throw CreditErrors.polarCustomerMissing(args.organizationId);
	}

	try {
		const portal = await polar.createCustomerPortal({ customerId });
		return { url: portal.url };
	} catch (error) {
		if (!isPolarMissingCustomerError(error)) throw error;
		const retryId = await ensurePolarCustomerForOrg({
			organizationId: args.organizationId,
			polar,
		});
		if (!retryId) {
			throw CreditErrors.polarCustomerMissing(args.organizationId);
		}
		const portal = await polar.createCustomerPortal({ customerId: retryId });
		return { url: portal.url };
	}
}
