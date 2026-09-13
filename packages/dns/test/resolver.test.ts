import { describe, expect, test } from "bun:test";
import {
	createResolver,
	DEFAULT_DNS_RESOLVERS,
	parseResolvers,
} from "@reloop/dns/resolver";

describe("parseResolvers", () => {
	test("splits a comma separated list and trims whitespace", () => {
		expect(parseResolvers("1.1.1.1, 9.9.9.9 ,8.8.8.8")).toEqual([
			"1.1.1.1",
			"9.9.9.9",
			"8.8.8.8",
		]);
	});

	test("falls back to the defaults when unset, empty, or only separators", () => {
		for (const value of [undefined, "", "   ", ",", " , , "]) {
			expect(parseResolvers(value)).toEqual(DEFAULT_DNS_RESOLVERS);
		}
	});

	test("keeps a single server", () => {
		expect(parseResolvers("10.0.0.53")).toEqual(["10.0.0.53"]);
	});
});

describe("createResolver", () => {
	test("applies the configured servers", () => {
		expect(createResolver("1.1.1.1,9.9.9.9").getServers()).toEqual([
			"1.1.1.1",
			"9.9.9.9",
		]);
	});

	test("defaults when no value is given", () => {
		expect(createResolver("").getServers()).toEqual(DEFAULT_DNS_RESOLVERS);
	});

	test("falls back to the defaults when a server is not a valid address", () => {
		expect(createResolver("not-an-ip").getServers()).toEqual(
			DEFAULT_DNS_RESOLVERS,
		);
	});
});
