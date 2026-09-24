import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import dns from "node:dns/promises";
import {
	clearDnsblCache,
	lookupDnsbl,
} from "../src/routes/tools/temp-email-checker/dnsbl-lookup";

describe("lookupDnsbl", () => {
	let resolve4Spy: ReturnType<typeof spyOn<typeof dns, "resolve4">>;

	beforeEach(() => {
		clearDnsblCache();
		resolve4Spy = spyOn(dns, "resolve4").mockImplementation(((host: string) => {
			if (host === "omanarts.com.multi.surbl.org") {
				return Promise.resolve(["127.0.0.4"]);
			}
			const err = new Error("queryA ENOTFOUND") as Error & { code: string };
			err.code = "ENOTFOUND";
			return Promise.reject(err);
		}) as unknown as typeof dns.resolve4);
	});

	afterEach(() => {
		resolve4Spy.mockRestore();
	});

	test("returns listed: false for empty or invalid input", async () => {
		const res1 = await lookupDnsbl("");
		expect(res1).toEqual({ listed: false, records: [] });

		const res2 = await lookupDnsbl("   ");
		expect(res2).toEqual({ listed: false, records: [] });
		expect(resolve4Spy).not.toHaveBeenCalled();
	});

	test("accurately flags known live disposable domains via SURBL", async () => {
		const res = await lookupDnsbl("omanarts.com");
		expect(res.listed).toBe(true);
		expect(res.records).toEqual(["127.0.0.4"]);
		expect(res.list).toBe("surbl");
		expect(resolve4Spy).toHaveBeenCalledWith("omanarts.com.multi.surbl.org");
	});

	test("returns listed: false for clean domains", async () => {
		const res = await lookupDnsbl("google.com");
		expect(res.listed).toBe(false);
		expect(res.records).toEqual([]);
		expect(resolve4Spy).toHaveBeenCalledWith("google.com.multi.surbl.org");
	});

	test("fails open on DNS network error or timeout", async () => {
		resolve4Spy.mockImplementation((() => {
			const err = new Error("queryA ETIMEDOUT") as Error & { code: string };
			err.code = "ETIMEDOUT";
			return Promise.reject(err);
		}) as unknown as typeof dns.resolve4);

		const res = await lookupDnsbl("timeout-domain.com");
		expect(res.listed).toBe(false);
		expect(res.records).toEqual([]);
	});

	test("caches lookup results to avoid redundant DNS requests", async () => {
		const first = await lookupDnsbl("omanarts.com");
		const second = await lookupDnsbl("omanarts.com");

		expect(first).toEqual(second);
		expect(resolve4Spy).toHaveBeenCalledTimes(1);
	});
});
