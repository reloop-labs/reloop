import { describe, expect, test } from "bun:test";
import {
	clearDnsblCache,
	lookupDnsbl,
} from "../src/routes/tools/temp-email-checker/dnsbl-lookup";

describe("lookupDnsbl", () => {
	test("returns listed: false for empty or invalid input", async () => {
		const res1 = await lookupDnsbl("");
		expect(res1).toEqual({ listed: false, records: [] });

		const res2 = await lookupDnsbl("   ");
		expect(res2).toEqual({ listed: false, records: [] });
	});

	test("accurately flags known live disposable domains via SURBL", async () => {
		const res = await lookupDnsbl("omanarts.com");
		expect(res.listed).toBe(true);
		expect(res.records.length).toBeGreaterThan(0);
		expect(res.list).toBe("surbl");
	});

	test("returns listed: false for clean domains", async () => {
		const res = await lookupDnsbl("google.com");
		expect(res.listed).toBe(false);
	});

	test("caches lookup results to avoid redundant DNS requests", async () => {
		clearDnsblCache();
		const start = performance.now();
		const first = await lookupDnsbl("omanarts.com");
		const duration1 = performance.now() - start;

		const startCached = performance.now();
		const second = await lookupDnsbl("omanarts.com");
		const duration2 = performance.now() - startCached;

		expect(first.listed).toBe(second.listed);
		expect(duration2).toBeLessThan(duration1 + 5);
	});
});
