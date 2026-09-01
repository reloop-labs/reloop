import { describe, expect, it } from "bun:test";
import { generateLookalikeCandidates } from "@be/tools/routes/tools/lookalike-watch/generate-candidates";
import {
	type LookalikeHit,
	evaluateLookalikes,
} from "@be/tools/routes/tools/lookalike-watch/lookalike-watch.service";

describe("Lookalike Domain Watch Service", () => {
	describe("Candidate Generation (generateLookalikeCandidates)", () => {
		it("generates TLD swaps, affixes, typos, and homoglyphs without original domain", () => {
			const candidates = generateLookalikeCandidates("acme.com", 65);
			const names = candidates.map((c) => c.name);

			// Should omit the original domain
			expect(names.includes("acme.com")).toBe(false);

			// Should include alternate TLDs
			expect(names.includes("acme.io")).toBe(true);
			expect(names.includes("acme.co")).toBe(true);
			expect(names.includes("acme.net")).toBe(true);

			// Should include affixes / hyphens
			expect(names.includes("acme-login.com")).toBe(true);
			expect(names.includes("acme-support.com")).toBe(true);
			expect(names.includes("login-acme.com")).toBe(true);

			// Should include typo omissions and duplicates
			expect(candidates.some((c) => c.trick === "typo")).toBe(true);

			// Should include homoglyphs (m <-> rn)
			expect(names.includes("acrne.com")).toBe(true);

			// Should be capped
			expect(candidates.length).toBeLessThanOrEqual(65);
		});

		it("handles multi-part TLDs (e.g. acme.co.uk)", () => {
			const candidates = generateLookalikeCandidates("acme.co.uk", 65);
			const names = candidates.map((c) => c.name);

			expect(names.includes("acme.co.uk")).toBe(false);
			expect(names.includes("acme.com")).toBe(true);
			expect(names.includes("acme-login.co.uk")).toBe(true);
		});
	});

	describe("Pure Evaluation (evaluateLookalikes)", () => {
		it("Case 1: Hit with active MX or SPF -> mail_twins", () => {
			const hits: LookalikeHit[] = [
				{
					name: "acme-login.com",
					unicodeName: null,
					trick: "affix",
					registered: true,
					mailCapable: true,
					mx: true,
					spf: true,
				},
				{
					name: "acme.io",
					unicodeName: null,
					trick: "tld",
					registered: true,
					mailCapable: false,
					mx: false,
					spf: false,
				},
			];

			const report = evaluateLookalikes("acme.com", "acme.com", hits, 60);

			expect(report.verdict).toBe("mail_twins");
			expect(report.headline).toBe("Lookalikes can send mail that looks like you");
			expect(report.hits[0]?.name).toBe("acme-login.com"); // mailCapable sorted first
		});

		it("Case 2: Hit with A/NS only (no MX/SPF) -> parked_twins", () => {
			const hits: LookalikeHit[] = [
				{
					name: "acme.io",
					unicodeName: null,
					trick: "tld",
					registered: true,
					mailCapable: false,
					mx: false,
					spf: false,
				},
			];

			const report = evaluateLookalikes("acme.com", "acme.com", hits, 60);

			expect(report.verdict).toBe("parked_twins");
			expect(report.headline).toBe("Twins exist; none look set up to send");
		});

		it("Case 3: Zero hits -> clear_scan (headline must not claim 100% safe)", () => {
			const report = evaluateLookalikes("obscuredomain999.com", "obscuredomain999.com", [], 60);

			expect(report.verdict).toBe("clear_scan");
			expect(report.headline).toBe("No common lookalikes in this scan");
			expect(report.headline.toLowerCase()).not.toContain("safe");
		});
	});
});
