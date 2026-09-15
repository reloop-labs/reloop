import { describe, expect, test } from "bun:test";
import {
	CAMPAIGN_BATCH_DELAY_MS,
	CAMPAIGN_BATCH_SIZE,
	nextBatchDelayMs,
	parseRetryAfter,
} from "../src/lib/campaign/batch";

describe("campaign batch workflow", () => {
	test("keeps each batch under the per-user send cap", () => {
		expect(CAMPAIGN_BATCH_SIZE).toBeLessThanOrEqual(50);
		expect(CAMPAIGN_BATCH_SIZE).toBeGreaterThan(0);
	});

	test("waits a full rate-limit window between batches", () => {
		expect(nextBatchDelayMs({})).toBe(CAMPAIGN_BATCH_DELAY_MS);
		expect(CAMPAIGN_BATCH_DELAY_MS).toBe(60_000);
	});

	test("honors Retry-After when rate limited, never shorter than one window", () => {
		expect(nextBatchDelayMs({ rateLimited: true, retryAfterSeconds: 15 })).toBe(
			CAMPAIGN_BATCH_DELAY_MS,
		);
		expect(nextBatchDelayMs({ rateLimited: true, retryAfterSeconds: 90 })).toBe(
			90_000,
		);
		expect(nextBatchDelayMs({ rateLimited: true })).toBe(
			CAMPAIGN_BATCH_DELAY_MS,
		);
	});
});

describe("parseRetryAfter", () => {
	test("reads delta-seconds", () => {
		expect(parseRetryAfter("12")).toBe(12);
		expect(parseRetryAfter("12.2")).toBe(13);
		expect(parseRetryAfter("0")).toBe(0);
	});

	test("reads HTTP-date values", () => {
		const at = new Date(Date.now() + 45_000).toUTCString();
		const seconds = parseRetryAfter(at);
		expect(seconds).toBeGreaterThanOrEqual(44);
		expect(seconds).toBeLessThanOrEqual(45);
	});

	test("ignores missing or junk values", () => {
		expect(parseRetryAfter(null)).toBeUndefined();
		expect(parseRetryAfter("")).toBeUndefined();
		expect(parseRetryAfter("soon")).toBeUndefined();
	});
});
