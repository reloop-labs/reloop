import { describe, expect, test } from "bun:test";
import { inspectSvgTinyPs } from "../src/lib/svg-tiny-ps";
import { parseTxtTags } from "../src/lib/txt-tags";
import { checkBimiController } from "../src/routes/tools/bimi-check/bimi-check.controllers";
import {
	evaluateDmarcForBimi,
	httpsUrlIssue,
	parseBimiRecord,
} from "../src/routes/tools/bimi-check/bimi-parse";

describe("parseTxtTags", () => {
	test("parses semicolon-separated DNS tags", () => {
		expect(
			parseTxtTags(
				"v=BIMI1; l=https://example.com/logo.svg; a=https://ca.example/vmc.pem",
			),
		).toEqual({
			v: "BIMI1",
			l: "https://example.com/logo.svg",
			a: "https://ca.example/vmc.pem",
		});
	});
});

describe("parseBimiRecord", () => {
	test("reads version, logo, and authority URLs", () => {
		const parsed = parseBimiRecord(
			"v=BIMI1; l=https://brand.example/bimi.svg; a=https://brand.example/vmc.pem",
		);
		expect(parsed.version).toBe("BIMI1");
		expect(parsed.logoUrl).toBe("https://brand.example/bimi.svg");
		expect(parsed.authorityUrl).toBe("https://brand.example/vmc.pem");
		expect(parsed.isDecline).toBe(false);
	});

	test("treats an empty l= as a decline-to-display assertion", () => {
		const parsed = parseBimiRecord("v=BIMI1; l=;");
		expect(parsed.logoUrl).toBe("");
		expect(parsed.isDecline).toBe(true);
	});
});

describe("evaluateDmarcForBimi", () => {
	test("requires quarantine or reject with pct=100", () => {
		expect(
			evaluateDmarcForBimi("v=DMARC1; p=reject; rua=mailto:dmarc@example.com"),
		).toMatchObject({ enforced: true, policy: "reject", pct: 100 });

		expect(
			evaluateDmarcForBimi("v=DMARC1; p=quarantine; pct=100"),
		).toMatchObject({ enforced: true });

		expect(evaluateDmarcForBimi("v=DMARC1; p=none")).toMatchObject({
			enforced: false,
			policy: "none",
		});

		expect(evaluateDmarcForBimi("v=DMARC1; p=reject; pct=50")).toMatchObject({
			enforced: false,
			pct: 50,
		});

		expect(evaluateDmarcForBimi("v=DMARC1; p=reject; pct=100x")).toMatchObject({
			enforced: false,
			pct: null,
		});

		expect(
			evaluateDmarcForBimi("v=DMARC1; p=reject; sp=none", { inherited: true }),
		).toMatchObject({
			enforced: false,
			policy: "none",
		});

		expect(evaluateDmarcForBimi(null)).toMatchObject({
			present: false,
			enforced: false,
		});
	});
});

describe("httpsUrlIssue", () => {
	test("rejects http and invalid URLs", () => {
		expect(httpsUrlIssue("http://example.com/logo.svg", "logo").ok).toBe(false);
		expect(httpsUrlIssue("not-a-url", "logo").ok).toBe(false);
		expect(httpsUrlIssue("https://example.com/logo.svg", "logo").ok).toBe(true);
	});
});

describe("inspectSvgTinyPs", () => {
	test("passes a square Tiny PS SVG", () => {
		const svg = `<svg version="1.2" baseProfile="tiny-ps" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="128" fill="#111"/></svg>`;
		const result = inspectSvgTinyPs(svg);
		expect(result.ok).toBe(true);
		expect(result.issues.some((i) => i.status === "fail")).toBe(false);
	});

	test("fails scripts and warns on missing tiny-ps profile", () => {
		const svg = `<svg viewBox="0 0 100 50"><script>alert(1)</script></svg>`;
		const result = inspectSvgTinyPs(svg);
		expect(result.ok).toBe(false);
		expect(result.issues.some((i) => i.code === "script")).toBe(true);
		expect(result.issues.some((i) => i.code === "baseProfile")).toBe(true);
		expect(result.issues.some((i) => i.code === "not-square")).toBe(true);
	});

	test("rejects protocol-relative hrefs", () => {
		const svg = `<svg version="1.2" baseProfile="tiny-ps" viewBox="0 0 128 128" href="//cdn.example/logo.png"></svg>`;
		const result = inspectSvgTinyPs(svg);
		expect(result.ok).toBe(false);
		expect(result.issues.some((i) => i.code === "external-ref")).toBe(true);
	});
});

describe("checkBimiController", () => {
	test("fails when BIMI and DMARC are missing", async () => {
		const result = await checkBimiController("example.com", {
			lookupTxt: async () => [],
			fetchLogo: false,
		});
		expect(result.domain).toBe("example.com");
		expect(result.queryName).toBe("default._bimi.example.com");
		expect(result.verdict).toBe("fail");
		expect(result.checks.find((c) => c.id === "bimi-present")?.status).toBe(
			"fail",
		);
		expect(result.checks.find((c) => c.id === "dmarc")?.status).toBe("fail");
	});

	test("passes a complete BIMI + enforced DMARC record without fetching the logo", async () => {
		const result = await checkBimiController("brand.example", {
			lookupTxt: async (name) => {
				if (name.startsWith("default._bimi.")) {
					return [
						"v=BIMI1; l=https://cdn.brand.example/bimi.svg; a=https://cdn.brand.example/vmc.pem",
					];
				}
				if (name.startsWith("_dmarc.")) {
					return [
						"v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@brand.example",
					];
				}
				return [];
			},
			fetchLogo: false,
		});
		expect(result.verdict).toBe("pass");
		expect(result.dmarcEnforced).toBe(true);
		expect(result.logoUrl).toBe("https://cdn.brand.example/bimi.svg");
		expect(result.authorityUrl).toBe("https://cdn.brand.example/vmc.pem");
	});

	test("warns when BIMI is present but DMARC is p=none and there is no VMC", async () => {
		const result = await checkBimiController("monitor.example", {
			lookupTxt: async (name) => {
				if (name.startsWith("default._bimi.")) {
					return ["v=BIMI1; l=https://cdn.monitor.example/logo.svg"];
				}
				if (name.startsWith("_dmarc.")) {
					return ["v=DMARC1; p=none"];
				}
				return [];
			},
			fetchLogo: false,
		});
		expect(result.verdict).toBe("fail");
		expect(result.dmarcEnforced).toBe(false);
		expect(result.checks.find((c) => c.id === "bimi-authority")?.status).toBe(
			"warn",
		);
	});

	test("rejects an invalid domain", async () => {
		expect(checkBimiController("nodot", { fetchLogo: false })).rejects.toThrow(
			"Invalid domain",
		);
	});

	test("inherits an enforcing parent DMARC policy for a subdomain", async () => {
		const result = await checkBimiController("mail.brand.example", {
			lookupTxt: async (name) => {
				if (name.startsWith("default._bimi.")) {
					return [
						"v=BIMI1; l=https://cdn.brand.example/bimi.svg; a=https://cdn.brand.example/vmc.pem",
					];
				}
				if (name === "_dmarc.brand.example") {
					return ["v=DMARC1; p=reject; sp=quarantine"];
				}
				return [];
			},
			fetchLogo: false,
		});
		expect(result.dmarcEnforced).toBe(true);
		expect(result.dmarcPolicy).toBe("quarantine");
		expect(result.verdict).toBe("pass");
	});

	test("fails when a lookup name publishes multiple DMARC records", async () => {
		const result = await checkBimiController("brand.example", {
			lookupTxt: async (name) => {
				if (name.startsWith("default._bimi.")) {
					return ["v=BIMI1; l=https://cdn.brand.example/bimi.svg"];
				}
				if (name === "_dmarc.brand.example") {
					return ["v=DMARC1; p=reject", "v=DMARC1; p=none"];
				}
				return [];
			},
			fetchLogo: false,
		});
		expect(result.dmarcEnforced).toBe(false);
		expect(result.checks.find((c) => c.id === "dmarc")?.status).toBe("fail");
	});
});
