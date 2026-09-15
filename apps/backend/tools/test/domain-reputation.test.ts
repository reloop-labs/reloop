import { checkDomainReputationController } from "@be/tools/routes/tools/domain-reputation/domain-reputation.controllers";
import {
	checkDomainReputation,
	isValidDomain,
	normalizeDomain,
} from "@be/tools/routes/tools/domain-reputation/domain-reputation.service";

describe("Domain Reputation Service", () => {
	describe("normalizeDomain", () => {
		it("normalizes domains and strips protocols, paths, www, ports, and trailing slashes", () => {
			expect(normalizeDomain("https://reloop.sh/tools")).toBe("reloop.sh");
			expect(normalizeDomain("HTTP://WWW.STRIPE.COM/")).toBe("stripe.com");
			expect(normalizeDomain("  github.com:443  ")).toBe("github.com");
			expect(normalizeDomain("example.com?query=1")).toBe("example.com");
			expect(normalizeDomain("domain.com.")).toBe("domain.com");
		});
	});

	describe("isValidDomain", () => {
		it("identifies valid and invalid domain formats", () => {
			expect(isValidDomain("reloop.sh")).toBe(true);
			expect(isValidDomain("sub.domain.co.uk")).toBe(true);
			expect(isValidDomain("google.com")).toBe(true);

			expect(isValidDomain("")).toBe(false);
			expect(isValidDomain("nodot")).toBe(false);
			expect(isValidDomain("invalid_domain.com")).toBe(false);
			expect(isValidDomain("-invalid.com")).toBe(false);
		});
	});

	describe("checkDomainReputation Integration", () => {
		it("evaluates a live production domain with score, grade, and breakdown", async () => {
			const report = await checkDomainReputation("reloop.sh");

			expect(report.domain).toBe("reloop.sh");
			expect(report.score).toBeGreaterThanOrEqual(0);
			expect(report.score).toBeLessThanOrEqual(100);
			expect(["A+", "A", "B", "C", "D", "F"]).toContain(report.grade);
			expect(["excellent", "good", "fair", "poor", "critical"]).toContain(
				report.verdict,
			);

			// Breakdowns exist
			expect(report.breakdown.authentication).toBeDefined();
			expect(report.breakdown.blocklist).toBeDefined();
			expect(report.breakdown.domainAge).toBeDefined();
			expect(report.breakdown.dnsHealth).toBeDefined();

			// Checks list
			expect(report.checks.length).toBeGreaterThanOrEqual(5);

			// Recommendations
			expect(Array.isArray(report.recommendations)).toBe(true);
		}, 15000);

		it("throws an error for invalid domains", async () => {
			expect(checkDomainReputation("not-a-domain")).rejects.toThrow();
		});
	});

	describe("checkDomainReputationController", () => {
		it("processes valid domain through controller", async () => {
			const result = await checkDomainReputationController("reloop.sh");
			expect(result.domain).toBe("reloop.sh");
			expect(result.score).toBeGreaterThanOrEqual(0);
		}, 15000);

		it("throws ToolsErrors on empty or invalid input", async () => {
			expect(checkDomainReputationController("")).rejects.toThrow();
			expect(checkDomainReputationController("not_valid")).rejects.toThrow();
		});
	});
});
