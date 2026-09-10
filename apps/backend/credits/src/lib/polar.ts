import { WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { creditsConfig } from "@reloop/credits/credits.config";
import { log } from "evlog";
import { Webhook } from "standardwebhooks";
import {
	createOrGetPolarCustomer,
	createPolarCheckout,
	createPolarCustomerPortal,
	ingestPolarEmailEvents,
	isPolarMissingCustomerError,
	isPolarMissingSubscriptionError,
	isPolarPaymentFailedError,
	listPolarProducts,
	updatePolarSubscription,
} from "./polar-http";

export type PolarCustomer = {
	id: string;
	externalId: string | null;
	email: string | null;
};

export type PolarCheckout = {
	id: string;
	url: string;
};

export type PolarPortal = {
	url: string;
};

export type PolarProductRef = {
	id: string;
	name: string;
	metadata: Record<string, unknown>;
};

export type PolarBillingPort = {
	enabled: boolean;
	listProducts(): Promise<PolarProductRef[]>;
	createOrGetCustomer(input: {
		externalId: string;
		email: string;
		name: string;
	}): Promise<PolarCustomer>;
	createCheckout(input: {
		productId: string;
		externalCustomerId: string;
		customerId?: string;
		customerEmail?: string;
		successUrl: string;
		returnUrl?: string;
		metadata: Record<string, string>;
	}): Promise<PolarCheckout>;
	createCustomerPortal(input: { customerId: string }): Promise<PolarPortal>;
	updateSubscription(input: {
		subscriptionId: string;
		productId: string;
	}): Promise<{ id: string }>;
	ingestEmailEvents(input: {
		externalCustomerId: string;
		count: number;
	}): Promise<void>;
};

export const livePolarBilling: PolarBillingPort = {
	enabled:
		creditsConfig.BILLING_ENABLED && Boolean(creditsConfig.POLAR_ACCESS_TOKEN),

	listProducts: listPolarProducts,

	createOrGetCustomer: createOrGetPolarCustomer,

	createCheckout: createPolarCheckout,
	createCustomerPortal: createPolarCustomerPortal,
	updateSubscription: updatePolarSubscription,
	ingestEmailEvents: ingestPolarEmailEvents,
};

function polarSignatureHeaders(
	headers: Record<string, string>,
): Record<string, string> {
	const lower: Record<string, string> = {};
	for (const [key, value] of Object.entries(headers)) {
		lower[key.toLowerCase()] = value;
	}
	return {
		"webhook-id": lower["webhook-id"] ?? "",
		"webhook-timestamp": lower["webhook-timestamp"] ?? "",
		"webhook-signature": lower["webhook-signature"] ?? "",
	};
}

function polarSignatureMatches(
	body: string,
	headers: Record<string, string>,
	librarySecret: string,
): boolean {
	try {
		new Webhook(librarySecret).verify(body, headers);
		return true;
	} catch {
		return false;
	}
}

function parsePolarWebhookBody(body: string): {
	type: string;
	data: Record<string, unknown>;
} {
	const parsed = JSON.parse(body) as {
		type?: string;
		data?: Record<string, unknown>;
	};
	if (typeof parsed.type === "string" && parsed.data) {
		return { type: parsed.type, data: parsed.data };
	}
	throw new Error("Polar webhook payload is missing type or data");
}

export function verifyPolarWebhook(args: {
	body: string;
	headers: Record<string, string>;
	secret?: string;
}): { type: string; data: Record<string, unknown> } {
	const secret = (args.secret ?? creditsConfig.POLAR_WEBHOOK_SECRET).trim();
	const headers = polarSignatureHeaders(args.headers);

	if (!secret) {
		log.warn("server", "Polar webhook signature rejected");
		throw new WebhookVerificationError("POLAR_WEBHOOK_SECRET is not set");
	}

	// Polar HMAC (secrets before 8 Sep 2026): UTF-8 bytes of the full secret,
	// base64-encoded for Standard Webhooks. Newer secrets are Standard
	// Webhooks: pass the dashboard secret (often `whsec_…`) as-is.
	const polarHmacSecret = Buffer.from(secret, "utf-8").toString("base64");
	const verified =
		polarSignatureMatches(args.body, headers, secret) ||
		polarSignatureMatches(args.body, headers, polarHmacSecret);

	if (!verified) {
		log.warn("server", "Polar webhook signature rejected");
		throw new WebhookVerificationError("No matching signature found");
	}

	return parsePolarWebhookBody(args.body);
}

export {
	isPolarMissingCustomerError,
	isPolarMissingSubscriptionError,
	isPolarPaymentFailedError,
	WebhookVerificationError,
};
