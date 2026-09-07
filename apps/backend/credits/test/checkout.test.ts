import { describe, expect, test } from "bun:test";
import { invalidatePolarPlanCatalog } from "../src/lib/polar-catalog";
import { createCheckoutController } from "../src/routes/billing/checkout/checkout.controllers";

describe("createCheckoutController", () => {
	test("rejects Free and Enterprise", async () => {
		await expect(
			createCheckoutController({
				organizationId: "org_1",
				planId: "free",
			}),
		).rejects.toMatchObject({ status: 400 });

		await expect(
			createCheckoutController({
				organizationId: "org_1",
				planId: "enterprise",
			}),
		).rejects.toMatchObject({ status: 400 });
	});

	test("rejects checkout when Polar billing is disabled", async () => {
		await expect(
			createCheckoutController({
				organizationId: "org_1",
				planId: "individual",
				polar: {
					enabled: false,
					listProducts: async () => [],
					createOrGetCustomer: async () => {
						throw new Error("unused");
					},
					createCheckout: async () => {
						throw new Error("unused");
					},
					createCustomerPortal: async () => {
						throw new Error("unused");
					},
					ingestEmailEvents: async () => {},
				},
			}),
		).rejects.toMatchObject({ status: 503 });
	});

	test("rejects checkout when Polar has no matching product", async () => {
		invalidatePolarPlanCatalog();
		await expect(
			createCheckoutController({
				organizationId: "org_1",
				planId: "individual",
				polar: {
					enabled: true,
					listProducts: async () => [],
					createOrGetCustomer: async () => {
						throw new Error("unused");
					},
					createCheckout: async () => {
						throw new Error("unused");
					},
					createCustomerPortal: async () => {
						throw new Error("unused");
					},
					ingestEmailEvents: async () => {},
				},
			}),
		).rejects.toMatchObject({ status: 503 });
	});
});
