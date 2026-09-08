import { creditsConfig } from "@reloop/credits/credits.config";
import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import {
	ensurePolarCustomerForOrg,
	getOrProvisionOrgBilling,
} from "@reloop/credits/lib/org-billing";
import type { PolarBillingPort } from "@reloop/credits/lib/polar";
import { livePolarBilling } from "@reloop/credits/lib/polar";
import { polarProductIdForPlan } from "@reloop/credits/lib/polar-catalog";
import { isCheckoutPlanId } from "@reloop/pricing";

export async function createCheckoutController(args: {
	organizationId: string;
	planId: string;
	polar?: PolarBillingPort;
}) {
	if (!isCheckoutPlanId(args.planId)) {
		throw CreditErrors.invalidCheckoutPlan(args.planId);
	}

	const polar = args.polar ?? livePolarBilling;
	if (!polar.enabled) {
		throw CreditErrors.billingDisabled();
	}

	const productId = await polarProductIdForPlan(args.planId, polar);
	if (!productId) {
		throw CreditErrors.polarNotConfigured(args.planId);
	}

	const billing = await getOrProvisionOrgBilling(args.organizationId);
	if (billing.plan.planId === args.planId) {
		throw CreditErrors.alreadyOnPlan(args.planId);
	}

	const polarCustomerId = await ensurePolarCustomerForOrg({
		organizationId: args.organizationId,
		polar,
	});

	const checkout = await polar.createCheckout({
		productId,
		externalCustomerId: args.organizationId,
		customerId: polarCustomerId ?? undefined,
		successUrl: creditsConfig.BILLING_SUCCESS_URL,
		returnUrl: creditsConfig.BILLING_RETURN_URL,
		metadata: {
			organization_id: args.organizationId,
			plan_id: args.planId,
		},
	});

	return { url: checkout.url, checkoutId: checkout.id };
}
