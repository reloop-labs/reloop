import { afterEach, describe, expect, test } from "bun:test";
import { isBillingEnabled } from "../src/billing-enabled";

const original = process.env.BILLING_ENABLED;

afterEach(() => {
	if (original === undefined) delete process.env.BILLING_ENABLED;
	else process.env.BILLING_ENABLED = original;
});

describe("isBillingEnabled", () => {
	test("unset means self-hosted", () => {
		delete process.env.BILLING_ENABLED;
		expect(isBillingEnabled()).toBe(false);
	});

	test("false and empty mean self-hosted", () => {
		process.env.BILLING_ENABLED = "false";
		expect(isBillingEnabled()).toBe(false);
		process.env.BILLING_ENABLED = "";
		expect(isBillingEnabled()).toBe(false);
	});

	test("true and 1 mean Reloop Cloud", () => {
		process.env.BILLING_ENABLED = "true";
		expect(isBillingEnabled()).toBe(true);
		process.env.BILLING_ENABLED = "1";
		expect(isBillingEnabled()).toBe(true);
	});
});
