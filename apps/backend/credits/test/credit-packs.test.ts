import { describe, expect, test } from "bun:test";
import {
	creditPackPriceCents,
	isValidCreditPackSize,
	planDisplayName,
} from "@reloop/pricing";
import { creditPackEmailsForOrder } from "../src/lib/polar-webhook";
import { createCreditsCheckoutController } from "../src/routes/billing/credits-checkout/credits-checkout.controllers";

describe("credit pack pricing", () => {
	test("matches the pricing page: $0.50 per 1,000 emails", () => {
		expect(creditPackPriceCents(10_000)).toBe(500);
		expect(creditPackPriceCents(3_000)).toBe(150);
		expect(creditPackPriceCents(100_000)).toBe(5_000);
	});

	test("only sells 3k–100k in 1k steps", () => {
		expect(isValidCreditPackSize(3_000)).toBe(true);
		expect(isValidCreditPackSize(100_000)).toBe(true);
		expect(isValidCreditPackSize(2_000)).toBe(false);
		expect(isValidCreditPackSize(101_000)).toBe(false);
		expect(isValidCreditPackSize(10_500)).toBe(false);
	});

	test("Pay as you go has a display name", () => {
		expect(planDisplayName("payg")).toBe("Pay as you go");
		expect(planDisplayName("individual")).toBe("Pro");
	});
});

describe("creditPackEmailsForOrder", () => {
	test("grants the pack when the full price was charged", () => {
		expect(
			creditPackEmailsForOrder({ requestedEmails: 10_000, subtotalCents: 500 }),
		).toBe(10_000);
	});

	test("never grants more than was paid for", () => {
		expect(
			creditPackEmailsForOrder({ requestedEmails: 10_000, subtotalCents: 150 }),
		).toBe(3_000);
		expect(
			creditPackEmailsForOrder({ requestedEmails: 10_000, subtotalCents: 0 }),
		).toBe(0);
	});

	test("rejects missing or invalid pack sizes", () => {
		expect(
			creditPackEmailsForOrder({
				requestedEmails: undefined,
				subtotalCents: 500,
			}),
		).toBe(0);
		expect(
			creditPackEmailsForOrder({ requestedEmails: 999, subtotalCents: 500 }),
		).toBe(0);
		expect(
			creditPackEmailsForOrder({
				requestedEmails: 10_000,
				subtotalCents: undefined,
			}),
		).toBe(0);
	});
});

describe("createCreditsCheckoutController", () => {
	const unused = async () => {
		throw new Error("unused");
	};

	test("rejects pack sizes we do not sell", async () => {
		await expect(
			createCreditsCheckoutController({ organizationId: "org_1", emails: 7 }),
		).rejects.toMatchObject({ status: 400 });
	});

	test("rejects checkout when Polar billing is disabled", async () => {
		await expect(
			createCreditsCheckoutController({
				organizationId: "org_1",
				emails: 10_000,
				polar: {
					enabled: false,
					listProducts: async () => [],
					listOneTimeProducts: async () => [],
					createOrGetCustomer: unused,
					createCheckout: unused,
					createCustomerPortal: unused,
					updateSubscription: unused,
					ingestEmailEvents: async () => {},
				},
			}),
		).rejects.toMatchObject({ status: 503 });
	});

	test("rejects checkout when no Polar credits product exists", async () => {
		await expect(
			createCreditsCheckoutController({
				organizationId: "org_1",
				emails: 10_000,
				polar: {
					enabled: true,
					listProducts: async () => [],
					listOneTimeProducts: async () => [
						{ id: "prod_other", name: "Sticker", metadata: {} },
					],
					createOrGetCustomer: unused,
					createCheckout: unused,
					createCustomerPortal: unused,
					updateSubscription: unused,
					ingestEmailEvents: async () => {},
				},
			}),
		).rejects.toMatchObject({ status: 503 });
	});
});
