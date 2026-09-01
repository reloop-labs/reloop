import { describe, expect, it } from "bun:test";
import {
	checkDomainAuth,
	cleanDomainInput,
	parseDkimRecord,
	parseDmarcRecord,
	parseSpfRecord,
} from "@be/tools/routes/tools/auth-checker/auth-checker.service";

describe("Email Authentication Service (SPF, DKIM, DMARC)", () => {
	describe("cleanDomainInput", () => {
		it("normalizes domains and strips protocols or paths", () => {
			expect(cleanDomainInput("https://stripe.com/docs")).toBe("stripe.com");
			expect(cleanDomainInput("HTTP://GOOGLE.COM/")).toBe("google.com");
			expect(cleanDomainInput("  apple.com.  ")).toBe("apple.com");
		});
	});

	describe("parseSpfRecord", () => {
		it("parses mechanisms, qualifier, includes, and IP ranges", () => {
			const spf = "v=spf1 ip4:192.0.2.1 include:_spf.google.com include:mailgun.org ~all";
			const result = parseSpfRecord(spf);

			expect(result.qualifier).toBe("~all");
			expect(result.lookupCount).toBe(2);
			expect(result.includes).toEqual(["_spf.google.com", "mailgun.org"]);
			expect(result.ip4).toEqual(["192.0.2.1"]);
			expect(result.warnings.length).toBe(0);
		});

		it("flags excessive DNS lookups over limit of 10", () => {
			const spf = "v=spf1 include:a.com include:b.com include:c.com include:d.com include:e.com include:f.com include:g.com include:h.com include:i.com include:j.com include:k.com -all";
			const result = parseSpfRecord(spf);

			expect(result.lookupCount).toBe(11);
			expect(result.warnings.some((w) => w.includes("exceeding the RFC 7208 limit"))).toBe(true);
		});

		it("flags dangerous +all qualifier", () => {
			const spf = "v=spf1 +all";
			const result = parseSpfRecord(spf);

			expect(result.qualifier).toBe("+all");
			expect(result.warnings.some((w) => w.includes("allows ANY IP"))).toBe(true);
		});
	});

	describe("parseDmarcRecord", () => {
		it("parses policy, aggregate rua address, and percentage", () => {
			const dmarc = "v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc-reports@stripe.com,mailto:reloop@dmarc.reloop.sh; aspf=s";
			const result = parseDmarcRecord(dmarc);

			expect(result.policy).toBe("reject");
			expect(result.subdomainPolicy).toBe("reject");
			expect(result.percentage).toBe(100);
			expect(result.rua.length).toBe(2);
			expect(result.spfAlignment).toBe("strict (s)");
			expect(result.warnings.length).toBe(0);
		});

		it("warns on monitoring-only policy p=none", () => {
			const dmarc = "v=DMARC1; p=none; rua=mailto:admin@example.com";
			const result = parseDmarcRecord(dmarc);

			expect(result.policy).toBe("none");
			expect(result.warnings.some((w) => w.includes("p=none"))).toBe(true);
		});
	});

	describe("parseDkimRecord", () => {
		it("extracts public key and estimates RSA bit length", () => {
			// 2048-bit base64 dummy key
			const fake2048Key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0Y".padEnd(392, "A");
			const dkim = `v=DKIM1; k=rsa; p=${fake2048Key}`;
			const result = parseDkimRecord(dkim);

			expect(result.algorithm).toBe("rsa");
			expect(result.keyLength).toBeGreaterThanOrEqual(2048);
			expect(result.warnings.length).toBe(0);
		});

		it("warns on missing public key", () => {
			const dkim = "v=DKIM1; k=rsa;";
			const result = parseDkimRecord(dkim);

			expect(result.publicKey).toBeNull();
			expect(result.warnings.some((w) => w.includes("missing the public key"))).toBe(true);
		});
	});

	describe("checkDomainAuth Integration", () => {
		it("analyzes a live production domain with strong authentication", async () => {
			const report = await checkDomainAuth("google.com");

			expect(report.domain).toBe("google.com");
			expect(report.score).toBeGreaterThan(50);
			expect(["A+", "A", "B"]).toContain(report.grade);
			expect(report.mx.published).toBe(true);
			expect(report.spf.published).toBe(true);
			expect(report.dmarc.published).toBe(true);
		}, 10000);
	});
});
