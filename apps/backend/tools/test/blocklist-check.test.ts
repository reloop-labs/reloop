import { describe, expect, it } from "bun:test";
import { checkBlocklistController } from "../src/routes/tools/blocklist-check/blocklist-check.controllers";
import {
	extractSpfMechanisms,
	normalizeTarget,
	parseTarget,
} from "../src/routes/tools/blocklist-check/blocklist-input";
import {
	DOMAIN_DNSBL_PROVIDERS,
	IP_DNSBL_PROVIDERS,
} from "../src/routes/tools/blocklist-check/dnsbl-providers";
import {
	aggregateVerdict,
	type DnsblItemResult,
	evaluateListingStatus,
	expandIpv6,
	reverseIpv4,
	reverseIpv6,
} from "../src/routes/tools/blocklist-check/dnsbl-query";

function item(
	overrides: Partial<DnsblItemResult> & Pick<DnsblItemResult, "id" | "status">,
): DnsblItemResult {
	return {
		name: overrides.id,
		host: `${overrides.id}.example`,
		listType: "ip",
		category: "spam",
		impact: "high",
		isListed: overrides.status === "listed",
		responseCodes: [],
		responseTimeMs: 1,
		delistUrl: "https://example.com",
		description: "",
		listedTargets: [],
		...overrides,
	};
}

describe("reverseIpv4", () => {
	it("reverses octets for RFC 5782 queries", () => {
		expect(reverseIpv4("192.0.2.1")).toBe("1.2.0.192");
		expect(reverseIpv4("127.0.0.2")).toBe("2.0.0.127");
	});
});

describe("reverseIpv6", () => {
	it("nibble-reverses an expanded IPv6 address", () => {
		expect(expandIpv6("2001:db8::1")).toBe(
			"2001:0db8:0000:0000:0000:0000:0000:0001",
		);
		expect(reverseIpv6("2001:db8::1")).toBe(
			"1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2",
		);
	});
});

describe("evaluateListingStatus", () => {
	it("treats 127.0.0.2 as listed (RFC 5782 test entry)", () => {
		expect(evaluateListingStatus(["127.0.0.2"])).toEqual({
			status: "listed",
			validCodes: ["127.0.0.2"],
		});
	});

	it("treats 127.0.0.1 as not listed (RFC 5782 negative test)", () => {
		expect(evaluateListingStatus(["127.0.0.1"])).toEqual({
			status: "not_listed",
			validCodes: [],
		});
	});

	it("treats 127.255.255.254 as a refused query, not a listing", () => {
		const result = evaluateListingStatus(["127.255.255.254"]);
		expect(result.status).toBe("error");
		expect(result.validCodes).toEqual([]);
		expect(result.error).toContain("127.255.255.254");
	});

	it("treats empty A-record sets as not listed", () => {
		expect(evaluateListingStatus([])).toEqual({
			status: "not_listed",
			validCodes: [],
		});
	});

	it("treats public A records as hijacking, not a listing", () => {
		const result = evaluateListingStatus(["8.8.8.8"]);
		expect(result.status).toBe("error");
		expect(result.validCodes).toEqual([]);
	});
});

describe("aggregateVerdict", () => {
	it("is listed when any list returned a hit", () => {
		const result = aggregateVerdict([
			item({ id: "zen", status: "listed", impact: "high" }),
			item({ id: "spamcop", status: "not_listed", impact: "high" }),
		]);
		expect(result.verdict).toBe("listed");
		expect(result.isClean).toBe(false);
		expect(result.listedCount).toBe(1);
	});

	it("is inconclusive when a high-impact list errors and none are listed", () => {
		const result = aggregateVerdict([
			item({ id: "zen", status: "error", impact: "high" }),
			item({ id: "spamcop", status: "not_listed", impact: "high" }),
		]);
		expect(result.verdict).toBe("inconclusive");
		expect(result.isClean).toBe(false);
	});

	it("is clean only when high-impact lists answered and none are listed", () => {
		const result = aggregateVerdict([
			item({ id: "zen", status: "not_listed", impact: "high" }),
			item({ id: "spamcop", status: "not_listed", impact: "high" }),
			item({ id: "uce", status: "error", impact: "low" }),
		]);
		expect(result.verdict).toBe("clean");
		expect(result.isClean).toBe(true);
		expect(result.errorCount).toBe(1);
	});
});

describe("parseTarget", () => {
	it("classifies IPv4, IPv6, and domains", () => {
		expect(parseTarget("192.0.2.1")).toEqual({
			target: "192.0.2.1",
			inputType: "ip",
			ipVersion: "ipv4",
		});
		expect(parseTarget("2001:db8::1").inputType).toBe("ip");
		expect(parseTarget("2001:db8::1").ipVersion).toBe("ipv6");
		expect(parseTarget("https://Example.com/path").target).toBe("example.com");
		expect(parseTarget("https://Example.com/path").inputType).toBe("domain");
	});

	it("strips ports and brackets", () => {
		expect(normalizeTarget("192.0.2.1:25")).toBe("192.0.2.1");
		expect(normalizeTarget("[2001:db8::1]")).toBe("2001:db8::1");
		expect(normalizeTarget("mail.example.com:25")).toBe("mail.example.com");
	});
});

describe("extractSpfMechanisms", () => {
	it("collects dedicated ip4/ip6 and leaves include: unexpanded", () => {
		const result = extractSpfMechanisms(
			"v=spf1 ip4:203.0.113.5 ip6:2001:db8::a include:_spf.google.com -all",
		);
		expect(result.ips).toEqual(["203.0.113.5", "2001:db8::a"]);
		expect(result.includes).toEqual(["_spf.google.com"]);
		expect(result.ranges).toEqual([]);
	});

	it("does not enumerate CIDR ranges", () => {
		const result = extractSpfMechanisms("v=spf1 ip4:203.0.113.0/24 -all");
		expect(result.ips).toEqual([]);
		expect(result.ranges).toEqual(["203.0.113.0/24"]);
	});
});

describe("DNSBL catalog", () => {
	it("uses Spamhaus ZEN once, without SBL/XBL/PBL/CBL child zones", () => {
		const ids = IP_DNSBL_PROVIDERS.map((provider) => provider.id);
		expect(ids).toContain("spamhaus-zen");
		expect(ids).not.toContain("spamhaus-sbl");
		expect(ids).not.toContain("spamhaus-xbl");
		expect(ids).not.toContain("spamhaus-pbl");
		expect(ids).not.toContain("abuseat-cbl");
	});

	it("includes domain URI lists separately from IP lists", () => {
		const ids = DOMAIN_DNSBL_PROVIDERS.map((provider) => provider.id);
		expect(ids).toContain("spamhaus-dbl");
		expect(ids).toContain("uribl-multi");
		expect(ids).toContain("surbl-multi");
		expect(ids).toContain("sem-fresh");
		expect(ids).toContain("sem-urired");
	});

	it("keeps a comprehensive catalog of active IP and domain DNSBLs", () => {
		expect(IP_DNSBL_PROVIDERS).toHaveLength(35);
		expect(DOMAIN_DNSBL_PROVIDERS).toHaveLength(7);
	});

	it("includes companion URI lists and independent IP lists of the same class", () => {
		const ipIds = IP_DNSBL_PROVIDERS.map((provider) => provider.id);
		const domainIds = DOMAIN_DNSBL_PROVIDERS.map((provider) => provider.id);
		expect(ipIds).toContain("blocklist-de");
		expect(ipIds).toContain("dronebl");
		expect(ipIds).toContain("spfbl");
		expect(domainIds).toContain("nordspam-dbl");
		expect(domainIds).toContain("sem-uribl");
	});
});

describe("checkBlocklistController", () => {
	it("rejects an empty target", () => {
		expect(checkBlocklistController("")).rejects.toThrow("No target provided");
	});

	it("rejects a string that is not an IP or domain", () => {
		expect(checkBlocklistController("notadomain")).rejects.toThrow(
			"Invalid domain or IP",
		);
	});
});
