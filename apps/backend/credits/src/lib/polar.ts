import { Polar } from "@polar-sh/sdk";
import {
	validateEvent,
	WebhookVerificationError,
} from "@polar-sh/sdk/webhooks";
import { creditsConfig } from "@reloop/credits/credits.config";
import { log } from "evlog";

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

function polarClient(): Polar {
	return new Polar({
		accessToken: creditsConfig.POLAR_ACCESS_TOKEN,
		server: creditsConfig.POLAR_SERVER,
	});
}

function asCustomer(value: {
	id: string;
	externalId?: string | null;
	email?: string | null;
}): PolarCustomer {
	return {
		id: value.id,
		externalId: value.externalId ?? null,
		email: value.email ?? null,
	};
}

export const livePolarBilling: PolarBillingPort = {
	enabled:
		creditsConfig.BILLING_ENABLED && Boolean(creditsConfig.POLAR_ACCESS_TOKEN),

	async listProducts() {
		const polar = polarClient();
		const products: PolarProductRef[] = [];
		const pages = await polar.products.list({
			isArchived: false,
			isRecurring: true,
			limit: 100,
		});
		for await (const page of pages) {
			for (const product of page.result.items) {
				products.push({
					id: product.id,
					name: product.name,
					metadata: product.metadata ?? {},
				});
			}
		}
		return products;
	},

	async createOrGetCustomer(input) {
		const polar = polarClient();
		try {
			const existing = await polar.customers.getExternal({
				externalId: input.externalId,
			});
			return asCustomer(existing);
		} catch {
			// Create when Polar has no customer for this org yet.
		}

		const created = await polar.customers.create({
			email: input.email,
			name: input.name,
			externalId: input.externalId,
			type: "team",
			metadata: { organization_id: input.externalId },
		});
		return asCustomer(created);
	},

	async createCheckout(input) {
		const polar = polarClient();
		const checkout = await polar.checkouts.create({
			products: [input.productId],
			externalCustomerId: input.externalCustomerId,
			customerEmail: input.customerEmail,
			successUrl: input.successUrl,
			returnUrl: input.returnUrl,
			metadata: input.metadata,
		});
		if (!checkout.url) {
			throw new Error("Polar checkout did not return a URL");
		}
		return { id: checkout.id, url: checkout.url };
	},

	async createCustomerPortal(input) {
		const polar = polarClient();
		const session = await polar.customerSessions.create({
			customerId: input.customerId,
		});
		return { url: session.customerPortalUrl };
	},

	async ingestEmailEvents(input) {
		if (input.count <= 0) return;
		const polar = polarClient();
		const events = Array.from({ length: input.count }, () => ({
			name: "email_sent",
			externalCustomerId: input.externalCustomerId,
		}));
		await polar.events.ingest({ events });
	},
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
