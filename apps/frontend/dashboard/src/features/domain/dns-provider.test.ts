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
		expect(result?.docsSlug).toBe("cloudflare");
		expect(result?.docsUrl).toBe(
			"https://reloop.sh/docs/connect-domain/providers/cloudflare",
		);
		expect(result?.supportsAutoConnect).toBe(true);
	});

	it("maps Route 53 and popular registrar hosts", () => {
		expect(inferDnsProvider(["ns-123.awsdns-12.com"])?.docsSlug).toBe(
			"route53",
		);
		expect(inferDnsProvider(["ns1.domaincontrol.com"])?.docsSlug).toBe(
			"godaddy",
		);
		expect(inferDnsProvider(["dns1.registrar-servers.com"])?.docsSlug).toBe(
			"namecheap",
		);
		expect(inferDnsProvider(["ns1.squarespace.com"])?.docsSlug).toBe(
			"squarespace",
		);
	});

	it("enables auto-connect for Cloudflare, Vercel, NameSilo, and Domain Chief", () => {
		expect(
			inferDnsProvider(["ns1.vercel-dns.com"])?.supportsAutoConnect,
		).toBe(true);
		expect(inferDnsProvider(["ns1.dnsowl.com"])?.label).toBe("NameSilo");
		expect(inferDnsProvider(["ns1.dnsowl.com"])?.supportsAutoConnect).toBe(
			true,
		);
		expect(
			inferDnsProvider(["ns.domainchief.app"])?.supportsAutoConnect,
		).toBe(true);
	});

	it("maps Domain Connect hosts without Reloop auto-connect yet", () => {
		expect(inferDnsProvider(["ns1.ui-dns.com"])?.docsSlug).toBe("ionos");
		expect(inferDnsProvider(["ns1.as207960.net"])?.docsSlug).toBe(
			"glauca-digital",
		);
		expect(inferDnsProvider(["ns1.wordpress.com"])?.docsSlug).toBe(
			"wordpress-com",
		);
		expect(inferDnsProvider(["ns1.plesk.example.com"])?.docsSlug).toBe(
			"plesk",
		);
	});

	it("falls back to the DNS hub when no guide exists", () => {
		const result = inferDnsProvider(["ns1.example-unknown-dns.test"]);
		expect(result?.docsSlug).toBeNull();
		expect(result?.docsUrl).toBe(DNS_SETUP_HUB_URL);
		expect(result?.url).toBeNull();
		expect(result?.supportsAutoConnect).toBe(false);
	});
});
