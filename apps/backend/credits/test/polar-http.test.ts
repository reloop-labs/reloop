import { describe, expect, test } from "bun:test";
import {
	isPolarMissingCustomerError,
	isPolarPaymentFailedError,
	parsePolarCheckout,
	parsePolarCustomer,
	parsePolarOwnerMemberId,
	parsePolarPortal,
	parsePolarProductRefs,
	polarTeamCustomerCreateBody,
	PolarHttpError,
} from "../src/lib/polar-http";

const polarProductListWithUnitBased = {
	items: [
		{
			id: "8e53cbbb-9106-4da5-90ca-252e1b0f0fe8",
			name: "Individual",
			metadata: { plan_id: "individual" },
			prices: [
				{
					id: "889077b0-5a59-44b5-96a7-40c74f63a174",
					amount_type: "fixed",
					price_amount: 1000,
					price_currency: "usd",
				},
				{
					id: "d9599ff1-3c7f-46ea-a617-adc09a94db63",
					amount_type: "unit_based",
					price_currency: "usd",
					tiers: [{ lower: 1, upper: null, unit_amount: 0 }],
					minimum_units: 1,
					unit_label: null,
					maximum_units: null,
				},
			],
		},
		{
			id: "705db322-5880-4801-9b32-ad42507259d0",
			name: "Startup",
			metadata: {},
			prices: [
				{ amount_type: "fixed", price_amount: 2000, price_currency: "usd" },
				{
					amount_type: "unit_based",
					tiers: [],
					minimum_units: 1,
					unit_label: null,
					maximum_units: null,
				},
			],
		},
	],
	pagination: { total_count: 2, max_page: 1 },
};

describe("parsePolarProductRefs", () => {
	test("keeps plan products when Polar returns unit_based prices", () => {
		const products = parsePolarProductRefs(polarProductListWithUnitBased);
		expect(products).toEqual([
			{
				id: "8e53cbbb-9106-4da5-90ca-252e1b0f0fe8",
				name: "Individual",
				metadata: { plan_id: "individual" },
			},
			{
				id: "705db322-5880-4801-9b32-ad42507259d0",
				name: "Startup",
				metadata: {},
			},
		]);
	});

	test("ignores malformed product rows", () => {
		expect(
			parsePolarProductRefs({
				items: [{ name: "No id" }, null, { id: "prod_1", name: "Ok" }],
			}),
		).toEqual([{ id: "prod_1", name: "Ok", metadata: {} }]);
	});
});

describe("parsePolarCheckout", () => {
	test("reads checkout url even if the product embeds unit_based prices", () => {
		expect(
			parsePolarCheckout({
				id: "chk_1",
				url: "https://sandbox.polar.sh/checkout/chk_1",
				product: {
					name: "Individual",
					prices: [{ amount_type: "unit_based" }],
				},
			}),
		).toEqual({
			id: "chk_1",
			url: "https://sandbox.polar.sh/checkout/chk_1",
		});
	});
});

describe("parsePolarCustomer", () => {
	test("reads snake_case Polar customer fields", () => {
		expect(
			parsePolarCustomer({
				id: "cust_1",
				external_id: "org_1",
				email: "billing@example.com",
			}),
		).toEqual({
			id: "cust_1",
			externalId: "org_1",
			email: "billing@example.com",
		});
	});
});

describe("parsePolarPortal", () => {
	test("reads customer_portal_url", () => {
		expect(
			parsePolarPortal({
				customer_portal_url: "https://sandbox.polar.sh/portal/abc",
			}),
		).toEqual({ url: "https://sandbox.polar.sh/portal/abc" });
	});
});

describe("polarTeamCustomerCreateBody", () => {
	test("identifies Polar by Reloop org id and keeps billing email on the owner", () => {
		const body = polarTeamCustomerCreateBody({
			externalId: "org_2",
			email: "reloop.sh@gmail.com",
			name: "Second Org",
		});
		expect(body).toEqual({
			type: "team",
			name: "Second Org",
			external_id: "org_2",
			metadata: { organization_id: "org_2" },
			owner: {
				email: "reloop.sh@gmail.com",
				name: "Second Org",
				external_id: "org_2",
			},
		});
		expect(body).not.toHaveProperty("email");
	});
});

describe("parsePolarOwnerMemberId", () => {
	test("picks the Polar team owner for portal sessions", () => {
		expect(
			parsePolarOwnerMemberId({
				items: [
					{ id: "mem_member", role: "member" },
					{ id: "mem_owner", role: "owner" },
				],
			}),
		).toBe("mem_owner");
	});
});

describe("isPolarMissingCustomerError", () => {
	test("detects Polar portal 422 for a deleted Polar customer", () => {
		expect(
			isPolarMissingCustomerError(
				new PolarHttpError(
					422,
					"/v1/customer-sessions/",
					JSON.stringify({
						error: "PolarRequestValidationError",
						detail: [
							{
								type: "value_error",
								loc: ["body", "customer_id"],
								msg: "Customer does not exist.",
								input: "70298b1b-31cf-46d6-a5e4-24a97ec2afdf",
							},
						],
					}),
				),
			),
		).toBe(true);
	});

	test("detects Polar 402 when the prorated charge fails", () => {
		expect(
			isPolarPaymentFailedError(
				new PolarHttpError(402, "/v1/subscriptions/sub_1", '{"error":"PaymentFailed"}'),
			),
		).toBe(true);
	});
});
