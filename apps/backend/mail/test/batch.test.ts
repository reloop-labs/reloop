import { describe, expect, test } from "bun:test";
import {
	deriveBatchItemIdempotencyKey,
	mapWithConcurrency,
	parseBatchValidationMode,
	toBatchItemError,
} from "@reloop/be-mail/lib/batch";
import { createError } from "evlog";

describe("parseBatchValidationMode", () => {
	test("defaults to strict", () => {
		expect(parseBatchValidationMode(null)).toBe("strict");
		expect(parseBatchValidationMode("nonsense")).toBe("strict");
	});

	test("accepts permissive case-insensitively", () => {
		expect(parseBatchValidationMode(" Permissive ")).toBe("permissive");
	});
});

describe("deriveBatchItemIdempotencyKey", () => {
	test("header key is suffixed with the index", () => {
		expect(
			deriveBatchItemIdempotencyKey({
				headerKey: "batch-1",
				itemKey: "ignored",
				index: 3,
			}),
		).toBe("batch-1:3");
	});

	test("falls back to the email's own key", () => {
		expect(
			deriveBatchItemIdempotencyKey({ itemKey: "order-9", index: 0 }),
		).toBe("order-9");
	});

	test("no key → undefined", () => {
		expect(
			deriveBatchItemIdempotencyKey({ headerKey: "  ", index: 0 }),
		).toBeUndefined();
	});

	test("long header keys still fit 500 chars with the suffix", () => {
		const key = deriveBatchItemIdempotencyKey({
			headerKey: "k".repeat(600),
			index: 99,
		});
		expect(key?.length).toBe(500);
		expect(key?.endsWith(":99")).toBe(true);
	});
});

describe("toBatchItemError", () => {
	test("keeps structured errors", () => {
		const err = createError({
			status: 402,
			message: "Quota exceeded",
			why: "no credits",
			fix: "upgrade",
		});
		expect(toBatchItemError(2, err)).toEqual({
			index: 2,
			message: "Quota exceeded",
			why: "no credits",
			fix: "upgrade",
			status: 402,
		});
	});

	test("masks internal errors", () => {
		const item = toBatchItemError(0, new Error("connection to db:5432 lost"));
		expect(item.status).toBe(500);
		expect(item.message).not.toContain("5432");
	});
});

describe("mapWithConcurrency", () => {
	test("keeps order, caps parallelism, captures rejections", async () => {
		let inFlight = 0;
		let peak = 0;
		const results = await mapWithConcurrency(
			[1, 2, 3, 4, 5, 6],
			2,
			async (n) => {
				inFlight++;
				peak = Math.max(peak, inFlight);
				await Bun.sleep(5);
				inFlight--;
				if (n === 4) throw new Error("boom");
				return n * 10;
			},
		);
		expect(peak).toBe(2);
		expect(results.map((r) => r.status)).toEqual([
			"fulfilled",
			"fulfilled",
			"fulfilled",
			"rejected",
			"fulfilled",
			"fulfilled",
		]);
		expect(results[5]).toEqual({ status: "fulfilled", value: 60 });
	});
});
