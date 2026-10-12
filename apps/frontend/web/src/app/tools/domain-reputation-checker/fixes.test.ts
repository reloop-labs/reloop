import { describe, expect, test } from "bun:test";
import type { DomainReputationResponse } from "./check-api";
import { buildFixes, buildProviderReadiness, parseTags } from "./fixes";

type Auth = DomainReputationResponse["details"]["authentication"];

function makeResult(
	auth: Partial<{ [K in keyof Auth]: Partial<Auth[K]> }> = {},
	overrides: {
		listed?: string[];
		tier?: DomainReputationResponse["details"]["domainAge"]["tier"];
		mx?: number;
	} = {},
): DomainReputationResponse {
	const category = {
		score: 100,
		weight: 25,
		status: "pass" as const,
		summary: "",
	};
	return {
		domain: "acme.com",
		resolvedAt: "2026-10-12T00:00:00.000Z",
		responseTimeMs: 1,
		score: 100,
		grade: "A+",
		verdict: "excellent",
		verdictLabel: "",
		breakdown: {
			authentication: category,
			blocklist: category,
			domainAge: category,
			dnsHealth: category,
		},
		details: {
			authentication: {
				spf: {
					exists: true,
					record: "v=spf1 include:_spf.google.com ~all",
					status: "pass",
					detail: "",
					...auth.spf,
				},
				dkim: {
					detected: true,
					selector: "s1",
					status: "pass",
					detail: "",
					...auth.dkim,
				},
				dmarc: {
					exists: true,
					record: "v=DMARC1; p=reject; pct=100; rua=mailto:r@acme.com",
					policy: "reject",
					pct: 100,
					status: "pass",
					detail: "",
					...auth.dmarc,
				},
			},
			blocklist: {
				cleanCount: 7,
				listedCount: overrides.listed?.length ?? 0,
				totalChecked: 7,
				listings: (overrides.listed ?? []).map((name) => ({
					zone: name,
					name,
					listed: true,
				})),
			},
			domainAge: {
				ageDays: 4000,
				tier: overrides.tier ?? "mature",
				detail: "",
			},
			dnsHealth: {
				mxRecords: Array.from({ length: overrides.mx ?? 1 }, (_, i) => ({
					exchange: `mx${i}.acme.com`,
					priority: 10,
				})),
				aRecords: [],
				nsRecords: [],
				hasPtr: true,
				sslValid: true,
			},
		},
		checks: [],
		recommendations: [],
	};
}

describe("buildFixes", () => {
	test("a healthy domain needs no fixes", () => {
		expect(buildFixes(makeResult())).toEqual([]);
	});

	test("missing DMARC suggests a monitoring record on _dmarc", () => {
		const [fix] = buildFixes(
			makeResult({
				dmarc: { exists: false, record: undefined, policy: undefined },
			}),
		);
		expect(fix?.id).toBe("dmarc-missing");
		expect(fix?.records[0]).toEqual({
			type: "TXT",
			host: "_dmarc",
			value: "v=DMARC1; p=none; pct=100; rua=mailto:dmarc@acme.com",
		});
	});

	test("p=none upgrades to quarantine and keeps the report address", () => {
		const [fix] = buildFixes(
			makeResult({
				dmarc: {
					record:
						"v=DMARC1; p=none; rua=mailto:reports@acme.com; sp=none; adkim=s",
					policy: "none",
				},
			}),
		);
		expect(fix?.id).toBe("dmarc-enforce");
		expect(fix?.records[0]?.value).toBe(
			"v=DMARC1; p=quarantine; pct=100; rua=mailto:reports@acme.com; adkim=s",
		);
	});

	test("SPF +all is replaced with ~all", () => {
		const [fix] = buildFixes(
			makeResult({ spf: { record: "v=spf1 include:_spf.google.com +all" } }),
		);
		expect(fix?.severity).toBe("fail");
		expect(fix?.records[0]?.value).toBe("v=spf1 include:_spf.google.com ~all");
	});

	test("failures sort before warnings", () => {
		const fixes = buildFixes(
			makeResult(
				{ dmarc: { policy: "none" }, dkim: { detected: false } },
				{ tier: "new", listed: ["Spamhaus DBL"] },
			),
		);
		const severities = fixes.map((f) => f.severity);
		expect(severities.lastIndexOf("fail")).toBeLessThan(
			severities.indexOf("warn"),
		);
		expect(fixes.map((f) => f.id)).toContain("blocklisted");
		expect(fixes.map((f) => f.id)).toContain("young-domain");
	});
});

describe("buildProviderReadiness", () => {
	test("a fully authenticated domain passes every provider", () => {
		for (const provider of buildProviderReadiness(makeResult())) {
			expect(provider.bulk.status).toBe("pass");
			expect(provider.all.status).not.toBe("fail");
		}
	});

	test("Outlook publishes no rule for low-volume senders", () => {
		const outlook = buildProviderReadiness(makeResult()).find(
			(p) => p.id === "outlook",
		);
		expect(outlook?.all.status).toBe("none");
	});

	test("SPF alone satisfies Gmail for everyone, but not iCloud or bulk rules", () => {
		const byId = Object.fromEntries(
			buildProviderReadiness(
				makeResult({ dkim: { detected: false }, dmarc: { exists: false } }),
			).map((p) => [p.id, p]),
		);
		expect(byId.gmail?.all.status).toBe("pass");
		expect(byId.gmail?.bulk).toEqual({
			status: "fail",
			missing: ["DKIM", "DMARC"],
		});
		expect(byId.icloud?.all).toEqual({
			status: "fail",
			missing: ["DKIM", "DMARC"],
		});
	});

	test("no authentication fails Gmail's rule for everyone", () => {
		const gmail = buildProviderReadiness(
			makeResult({ spf: { exists: false }, dkim: { detected: false } }),
		).find((p) => p.id === "gmail");
		expect(gmail?.all).toEqual({ status: "fail", missing: ["SPF or DKIM"] });
	});
});

test("parseTags reads DMARC tag lists", () => {
	const tags = parseTags("v=DMARC1; p=reject; RUA=mailto:a@b.com");
	expect(tags.get("p")).toBe("reject");
	expect(tags.get("rua")).toBe("mailto:a@b.com");
});
