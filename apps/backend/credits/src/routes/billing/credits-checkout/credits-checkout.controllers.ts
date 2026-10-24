import { creditsConfig } from "@reloop/credits/credits.config";
import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { ensurePolarCustomerForOrg } from "@reloop/credits/lib/org-billing";
import {
	livePolarBilling,
	type PolarBillingPort,
} from "@reloop/credits/lib/polar";
import { polarCreditsProductId } from "@reloop/credits/lib/polar-catalog";
import { creditPackPriceCents, isValidCreditPackSize } from "@reloop/pricing";

/** One-time Polar checkout for a pay-as-you-go email credit pack. */
export async function createCreditsCheckoutController(args: {
	organizationId: string;
	emails: number;
	polar?: PolarBillingPort;
}) {
	if (!isValidCreditPackSize(args.emails)) {
		throw CreditErrors.invalidCreditPack(args.emails);
	}

	const polar = args.polar ?? livePolarBilling;
	if (!polar.enabled) {
		throw CreditErrors.billingDisabled();
	}

	const productId = await polarCreditsProductId(
		polar,
		creditsConfig.POLAR_CREDITS_PRODUCT_ID,
	);
	if (!productId) {
		throw CreditErrors.creditsProductNotConfigured();
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
		priceCents: creditPackPriceCents(args.emails),
		metadata: {
			organization_id: args.organizationId,
			kind: "credits",
			emails: String(args.emails),
		},
	});

	return { url: checkout.url, checkoutId: checkout.id };
}
