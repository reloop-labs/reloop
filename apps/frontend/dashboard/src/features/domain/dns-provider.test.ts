import { describe, expect, it } from "vitest";
import {
	DNS_SETUP_HUB_URL,
	inferDnsProvider,
} from "./dns-provider";

describe("inferDnsProvider", () => {
	it("returns null for empty nameservers", () => {
		expect(inferDnsProvider(null)).toBeNull();
		expect(inferDnsProvider([])).toBeNull();
	});

	it("maps Cloudflare nameservers to the Cloudflare guide", () => {
		const result = inferDnsProvider(["ada.ns.cloudflare.com"]);
		expect(result?.label).toBe("Cloudflare");
		expect(result?.docsSlug).toBe("dns-cloudflare");
		expect(result?.docsUrl).toBe(
			"https://reloop.sh/docs/guides/dns-cloudflare",
		);
	});

	it("maps Route 53 nameservers to the Route 53 guide", () => {
		const result = inferDnsProvider(["ns-123.awsdns-12.com"]);
		expect(result?.label).toBe("AWS Route 53");
		expect(result?.docsSlug).toBe("dns-route53");
	});

	it("maps GoDaddy nameservers to the GoDaddy guide", () => {
		const result = inferDnsProvider(["ns1.domaincontrol.com"]);
		expect(result?.docsSlug).toBe("dns-godaddy");
	});

	it("falls back to the DNS hub when no guide exists", () => {
		const result = inferDnsProvider(["ns1.digitalocean.com"]);
		expect(result?.label).toBe("DigitalOcean");
		expect(result?.docsSlug).toBeNull();
		expect(result?.docsUrl).toBe(DNS_SETUP_HUB_URL);
	});

	it("falls back to hub for unknown nameservers", () => {
		const result = inferDnsProvider(["ns1.example-unknown-dns.test"]);
		expect(result?.docsSlug).toBeNull();
		expect(result?.docsUrl).toBe(DNS_SETUP_HUB_URL);
		expect(result?.url).toBeNull();
	});
});
