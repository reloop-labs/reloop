import { describe, expect, test } from "bun:test";
import {
	DOMAIN_VERIFY_ATTEMPTS,
	DOMAIN_VERIFY_CHECK_TIMES_MS,
	DOMAIN_VERIFY_INITIAL_DELAY_MS,
	getDomainVerifyBackoffDelay,
} from "./domain-verify-schedule";

describe("domain verify schedule", () => {
	test("polls every 10s in the first minute", () => {
		expect(DOMAIN_VERIFY_CHECK_TIMES_MS.slice(0, 6)).toEqual([
			5_000, 15_000, 25_000, 35_000, 45_000, 55_000,
		]);
	});

	test("keeps trying for an hour, never more", () => {
		expect(DOMAIN_VERIFY_CHECK_TIMES_MS.at(-1)).toBeLessThanOrEqual(3_600_000);
		expect(DOMAIN_VERIFY_CHECK_TIMES_MS.at(-1)).toBeGreaterThan(3_300_000);
	});

	test("backoff delays replay the absolute schedule", () => {
		let at = DOMAIN_VERIFY_INITIAL_DELAY_MS;
		const replayed = [at];
		for (let made = 1; made < DOMAIN_VERIFY_ATTEMPTS; made++) {
			const delay = getDomainVerifyBackoffDelay(made);
			expect(delay).toBeGreaterThan(0);
			at += delay;
			replayed.push(at);
		}
		expect(replayed).toEqual([...DOMAIN_VERIFY_CHECK_TIMES_MS]);
		expect(getDomainVerifyBackoffDelay(DOMAIN_VERIFY_ATTEMPTS)).toBe(0);
	});
});
