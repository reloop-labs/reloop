import { describe, expect, test } from "bun:test";
import { assertDisplayNameNotSpoofed } from "../src/lib/outbound-guard";

describe("assertDisplayNameNotSpoofed", () => {
	test("allows generic role names on the sender's own domain", () => {
		for (const name of [
			"Support",
			"Excaliclaw Support",
			"Billing",
			"Security Team",
		]) {
			expect(() =>
				assertDisplayNameNotSpoofed(`${name} <support@excaliclaw.com>`),
			).not.toThrow();
		}
	});

	test("blocks third-party brand impersonation", () => {
		expect(() =>
			assertDisplayNameNotSpoofed("PayPal Support <help@excaliclaw.com>"),
		).toThrow();
		expect(() =>
			assertDisplayNameNotSpoofed("UPS <track@startups.io>"),
		).toThrow();
	});

	test("allows a brand sending from its own domain", () => {
		expect(() =>
			assertDisplayNameNotSpoofed("Stripe <notify@stripe.com>"),
		).not.toThrow();
		expect(() =>
			assertDisplayNameNotSpoofed("Bank of America <a@mail.bankofamerica.com>"),
		).not.toThrow();
	});
});
