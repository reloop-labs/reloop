import {
	validateEvent,
	WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { creditsConfig } from "@reloop/credits/credits.config";
import { log } from "evlog";
import {
	createOrGetPolarCustomer,
	createPolarCheckout,
	createPolarCustomerPortal,
	ingestPolarEmailEvents,
	listPolarProducts,
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
	ingestEmailEvents: ingestPolarEmailEvents,
};

export function verifyPolarWebhook(args: {
	body: string;
	headers: Record<string, string>;
}): { type: string; data: Record<string, unknown> } {
	try {
		const event = validateEvent(
			args.body,
			args.headers,
			creditsConfig.POLAR_WEBHOOK_SECRET,
		);
		return {
			type: event.type,
			data: event.data as unknown as Record<string, unknown>,
		};
	} catch (error) {
		if (error instanceof WebhookVerificationError) {
			log.warn("server", "Polar webhook signature rejected");
			throw error;
		}
		// Signature verified; Polar may send event types the SDK parser
		// does not know yet (cycled, past_due).
		const parsed = JSON.parse(args.body) as {
			type?: string;
			data?: Record<string, unknown>;
		};
		if (typeof parsed.type === "string" && parsed.data) {
			return { type: parsed.type, data: parsed.data };
		}
		throw error;
	}
}

export { WebhookVerificationError };
