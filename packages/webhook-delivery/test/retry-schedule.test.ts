import { describe, expect, test } from "bun:test";
import {
	getWebhookRetryDelayMs,
	WEBHOOK_MAX_ATTEMPTS,
	WEBHOOK_RETRY_DELAYS_MS,
	webhookDeliveryJobOptions,
} from "../src/index";

describe("getWebhookRetryDelayMs", () => {
	test("matches documented schedule for attemptsMade 1..6", () => {
		// After first failure (attemptsMade=1) → 5s before attempt 2
		expect(getWebhookRetryDelayMs(1)).toBe(5_000);
		expect(getWebhookRetryDelayMs(2)).toBe(5 * 60_000);
		expect(getWebhookRetryDelayMs(3)).toBe(30 * 60_000);
		expect(getWebhookRetryDelayMs(4)).toBe(2 * 60 * 60_000);
		expect(getWebhookRetryDelayMs(5)).toBe(5 * 60 * 60_000);
		expect(getWebhookRetryDelayMs(6)).toBe(10 * 60 * 60_000);
	});

	test("caps at last delay", () => {
		expect(getWebhookRetryDelayMs(99)).toBe(
			WEBHOOK_RETRY_DELAYS_MS[WEBHOOK_RETRY_DELAYS_MS.length - 1],
		);
	});
});

describe("webhookDeliveryJobOptions", () => {
	test("uses deliveryId as jobId and max attempts", () => {
		const opts = webhookDeliveryJobOptions("whde_abc");
		expect(opts.jobId).toBe("whde_abc");
		expect(opts.attempts).toBe(WEBHOOK_MAX_ATTEMPTS);
		expect(opts.backoff.type).toBe("webhook-retry");
		expect("delay" in opts).toBe(false);
	});

	test("accepts per-webhook attempts and delay", () => {
		const opts = webhookDeliveryJobOptions("whde_abc", {
			attempts: 3,
			delayMs: 5_000,
		});
		expect(opts.attempts).toBe(3);
		expect(opts.delay).toBe(5_000);
	});
});
