import { describe, expect, test } from "bun:test";
import {
	buildDkimRecord,
	dkimDnsName,
	generateDkimRecord,
	pemToDkimPublicKey,
} from "../src/routes/tools/record-generate/dkim-generate";
import { generateDmarcRecord } from "../src/routes/tools/record-generate/dmarc-generate";
import {
	attachExistingSpf,
	countSpfLookups,
	generateSpfRecord,
} from "../src/routes/tools/record-generate/spf-generate";

describe("generateSpfRecord", () => {
	test("builds a copy-pasteable record from IPs and includes", () => {
		const result = generateSpfRecord({
			domain: "Example.COM",
			ipv4: ["203.0.113.10", "203.0.113.10"],
			ipv6: ["2001:db8::1"],
			includes: ["spf.reloop.sh"],
			mx: true,
			policy: "-all",
		});
		expect(result.domain).toBe("example.com");
		expect(result.dnsName).toBe("example.com");
		expect(result.record).toBe(
			"v=spf1 ip4:203.0.113.10 ip6:2001:db8::1 mx include:spf.reloop.sh -all",
		);
		expect(result.lookupCount).toBe(2);
		expect(result.warnings.some((w) => w.code === "lookup-limit")).toBe(false);
	});

	test("fails +all and the 10-lookup limit", () => {
		const result = generateSpfRecord({
			domain: "example.com",
			includes: Array.from({ length: 11 }, (_, i) => `spf${i}.example.net`),
			policy: "+all",
		});
		expect(result.warnings.some((w) => w.code === "plus-all")).toBe(true);
		expect(result.warnings.some((w) => w.code === "lookup-limit")).toBe(true);
		expect(countSpfLookups(result.record.split(/\s+/))).toBe(11);
	});

	test("warns when an SPF record already exists", async () => {
		const generated = generateSpfRecord({
			domain: "example.com",
			ipv4: ["192.0.2.1"],
			policy: "~all",
		});
		const withExisting = await attachExistingSpf(generated, async () => [
			"v=spf1 include:old.example.net -all",
		]);
		expect(withExisting.existingRecord).toContain("v=spf1");
		expect(withExisting.warnings.some((w) => w.code === "existing-spf")).toBe(
			true,
		);
	});

	test("flags multiple existing SPF records as invalid", async () => {
		const generated = generateSpfRecord({
			domain: "example.com",
			ipv4: ["192.0.2.1"],
		});
		const withExisting = await attachExistingSpf(generated, async () => [
			"v=spf1 ip4:1.2.3.4 -all",
			"v=spf1 include:other.example -all",
		]);
		expect(withExisting.warnings.some((w) => w.code === "duplicate-spf")).toBe(
			true,
		);
	});
});

describe("generateDkimRecord", () => {
	test("returns a 2048-bit record at selector._domainkey.domain", async () => {
		const result = await generateDkimRecord({
			domain: "example.com",
			selector: "reloop",
		});
		expect(result.dnsName).toBe(dkimDnsName("reloop", "example.com"));
		expect(result.record).toBe(buildDkimRecord(result.publicKey));
		expect(result.record.startsWith("v=DKIM1; k=rsa; p=")).toBe(true);
		expect(result.publicKey.length).toBeGreaterThan(300);
		expect(result.privateKey).toContain("BEGIN PRIVATE KEY");
		expect(result.bits).toBe(2048);
		expect(
			pemToDkimPublicKey(
				"-----BEGIN PUBLIC KEY-----\nABC\n-----END PUBLIC KEY-----",
			),
		).toBe("ABC");
	});

	test("rejects a bad selector", async () => {
		expect(
			generateDkimRecord({ domain: "example.com", selector: "bad selector" }),
		).rejects.toThrow("Invalid DKIM selector");
	});
});

describe("generateDmarcRecord", () => {
	test("builds _dmarc.domain with rua and policy", () => {
		const result = generateDmarcRecord({
			domain: "Example.com",
			policy: "quarantine",
			rua: "dmarc@example.com",
			adkim: "s",
			aspf: "r",
			sp: "none",
		});
		expect(result.dnsName).toBe("_dmarc.example.com");
		expect(result.record).toBe(
			"v=DMARC1; p=quarantine; sp=none; adkim=s; rua=mailto:dmarc@example.com;",
		);
		expect(result.warnings.some((w) => w.severity === "fail")).toBe(false);
	});

	test("warns on p=none without rua and rejects a bad mailbox", () => {
		const none = generateDmarcRecord({ domain: "example.com", policy: "none" });
		expect(none.warnings.some((w) => w.code === "monitor-only")).toBe(true);
		expect(none.warnings.some((w) => w.code === "no-rua")).toBe(true);

		const bad = generateDmarcRecord({
			domain: "example.com",
			policy: "none",
			rua: "not-an-email",
		});
		expect(bad.warnings.some((w) => w.code === "bad-rua")).toBe(true);
	});

	test("warns when pct is below 100 on an enforcement policy", () => {
		const result = generateDmarcRecord({
			domain: "example.com",
			policy: "reject",
			pct: 50,
		});
		expect(result.record).toContain("pct=50");
		expect(result.warnings.some((w) => w.code === "partial-pct")).toBe(true);
	});
});
