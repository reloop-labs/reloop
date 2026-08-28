import { describe, expect, it } from "bun:test";
import { dnsLookupController } from "../src/routes/tools/dns-lookup/dns-lookup.controllers";
import {
	detectDnsProvider,
} from "../src/routes/tools/dns-lookup/dns-providers";
import {
	parseQueryInput,
	performDnsLookup,
} from "../src/routes/tools/dns-lookup/dns-lookup.service";

describe("DNS Provider Detector", () => {
	it("detects Cloudflare nameservers", () => {
		const provider = detectDnsProvider(["ns1.cloudflare.com", "ns2.cloudflare.com"]);
		expect(provider).not.toBeNull();
		expect(provider?.id).toBe("cloudflare");
		expect(provider?.name).toBe("Cloudflare");
	});

	it("detects AWS Route 53 nameservers", () => {
		const provider = detectDnsProvider(["ns-123.awsdns-45.org", "ns-678.awsdns-12.com"]);
		expect(provider).not.toBeNull();
		expect(provider?.id).toBe("aws-route53");
	});

	it("detects Google Cloud DNS nameservers", () => {
		const provider = detectDnsProvider(["ns-cloud-a1.googledomains.com"]);
		expect(provider).not.toBeNull();
		expect(provider?.id).toBe("google-cloud-dns");
	});

	it("returns null for unknown nameservers", () => {
		const provider = detectDnsProvider(["custom.internal-ns.local"]);
		expect(provider).toBeNull();
	});
});

describe("DNS Query Input Parser", () => {
	it("parses bare domain as ANY query", () => {
		const parsed = parseQueryInput("example.com");
		expect(parsed.target).toBe("example.com");
		expect(parsed.requestedType).toBe("ANY");
	});

	it("parses prefixed queries like a:domain.com", () => {
		const parsed = parseQueryInput("a:ohraya.com");
		expect(parsed.target).toBe("ohraya.com");
		expect(parsed.requestedType).toBe("A");
	});

	it("parses mx: prefix", () => {
		const parsed = parseQueryInput("mx:google.com");
		expect(parsed.target).toBe("google.com");
		expect(parsed.requestedType).toBe("MX");
	});

	it("parses dmarc: prefix and expands to _dmarc.<domain>", () => {
		const parsed = parseQueryInput("dmarc:example.com");
		expect(parsed.target).toBe("_dmarc.example.com");
		expect(parsed.requestedType).toBe("TXT");
	});

	it("strips https:// protocol and trailing slash", () => {
		const parsed = parseQueryInput("https://reloop.sh/");
		expect(parsed.target).toBe("reloop.sh");
	});
});

describe("performDnsLookup & Controller", () => {
	it("rejects empty target in controller", async () => {
		expect(dnsLookupController("")).rejects.toThrow();
	});

	it("resolves DNS records for a known public domain", async () => {
		const result = await performDnsLookup("cloudflare.com");
		expect(result.domain).toBe("cloudflare.com");
		expect(result.records.length).toBeGreaterThan(0);
		expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
		expect(result.summary.hasA).toBe(true);
		expect(result.diagnostics.length).toBeGreaterThan(0);
	});

	it("handles specific record type queries", async () => {
		const result = await performDnsLookup("google.com", "MX");
		expect(result.recordType).toBe("MX");
		expect(result.records.every((r) => r.type === "MX")).toBe(true);
		expect(result.records.length).toBeGreaterThan(0);
	});

	it("performs reverse PTR lookup when given an IP", async () => {
		const result = await performDnsLookup("1.1.1.1");
		expect(result.recordType).toBe("PTR");
		expect(result.records.length).toBeGreaterThan(0);
		expect(result.records[0]?.type).toBe("PTR");
	});
});
