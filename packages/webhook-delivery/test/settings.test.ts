import { describe, expect, test } from "bun:test";
import {
	WEBHOOK_MAX_ATTEMPTS,
	applyWebhookFilters,
	isWebhookRateLimited,
	matchesWebhookFilters,
	rateLimitDelayMs,
	resolveWebhookMaxAttempts,
} from "../src/index";

describe("resolveWebhookMaxAttempts", () => {
	test("defaults to WEBHOOK_MAX_ATTEMPTS", () => {
		expect(resolveWebhookMaxAttempts(undefined)).toBe(WEBHOOK_MAX_ATTEMPTS);
		expect(resolveWebhookMaxAttempts(null)).toBe(WEBHOOK_MAX_ATTEMPTS);
	});

	test("clamps to 1..max", () => {
		expect(resolveWebhookMaxAttempts(0)).toBe(1);
		expect(resolveWebhookMaxAttempts(-3)).toBe(1);
		expect(resolveWebhookMaxAttempts(3)).toBe(3);
		expect(resolveWebhookMaxAttempts(99)).toBe(WEBHOOK_MAX_ATTEMPTS);
		expect(resolveWebhookMaxAttempts(2.9)).toBe(2);
	});
});

describe("matchesWebhookFilters", () => {
	test("passes when no conditions", () => {
		expect(matchesWebhookFilters({ status: "sent" }, null)).toBe(true);
		expect(matchesWebhookFilters({ status: "sent" }, {})).toBe(true);
		expect(
			matchesWebhookFilters({ status: "sent" }, { matchConditions: {} }),
		).toBe(true);
	});

	test("requires all matchConditions", () => {
		const data = { status: "bounced", email_id: "em_1" };
		expect(
			matchesWebhookFilters(data, { matchConditions: { status: "bounced" } }),
		).toBe(true);
		expect(
			matchesWebhookFilters(data, { matchConditions: { status: "sent" } }),
		).toBe(false);
		expect(
			matchesWebhookFilters(data, {
				matchConditions: { status: "bounced", email_id: "em_1" },
			}),
		).toBe(true);
		expect(
			matchesWebhookFilters(data, {
				matchConditions: { status: "bounced", email_id: "em_other" },
			}),
		).toBe(false);
	});
});

describe("applyWebhookFilters", () => {
	test("strips excludeFields shallowly", () => {
		const data = { email_id: "em_1", subject: "Hi", status: "sent" };
		expect(
			applyWebhookFilters(data, { excludeFields: ["subject"] }),
		).toEqual({ email_id: "em_1", status: "sent" });
		// original untouched
		expect(data.subject).toBe("Hi");
	});

	test("no-op without excludeFields", () => {
		const data = { a: 1 };
		expect(applyWebhookFilters(data, null)).toBe(data);
	});
});

describe("rate limit helpers", () => {
	test("isWebhookRateLimited", () => {
		expect(isWebhookRateLimited(60, 60)).toBe(false);
		expect(isWebhookRateLimited(61, 60)).toBe(true);
		expect(isWebhookRateLimited(1, 0)).toBe(false); // invalid max → default 60
		expect(isWebhookRateLimited(61, undefined)).toBe(true);
	});

	test("rateLimitDelayMs", () => {
		expect(rateLimitDelayMs(30)).toBe(30_000);
		expect(rateLimitDelayMs(0)).toBe(60_000);
		expect(rateLimitDelayMs(-1)).toBe(60_000);
		expect(rateLimitDelayMs(0.2)).toBe(1_000);
	});
});
