import { describe, expect, it } from "bun:test";
import {
	type SpoofCheckResult,
	evaluateSpoofability,
} from "@be/tools/routes/tools/spoof-checker/spoof-checker.service";

describe("Spoof Checker Service (evaluateSpoofability pure logic)", () => {
	const baseAuthSpf = {
		status: "pass" as const,
		published: true,
		rawRecord: "v=spf1 include:_spf.google.com ~all",
		qualifier: "~all",
		lookupCount: 1,
		mechanisms: ["include:_spf.google.com", "~all"],
		includes: ["_spf.google.com"],
		ip4: [],
		ip6: [],
		warnings: [],
	};

	const baseDkim = {
		published: true,
		selector: "s1",
		keyLength: 2048,
	};

	const baseMx = {
		published: true,
		provider: "Google Workspace",
	};

	it("Case 1: No DMARC at all -> spoofable (Yes)", () => {
		const res = evaluateSpoofability("newstartup.io", {
			spf: baseAuthSpf,
			dmarc: {
				published: false,
				policy: null,
				subdomainPolicy: null,
				percentage: null,
				rawRecord: null,
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("spoofable");
		expect(res.spoofable).toBe(true);
		expect(res.inboxOutcome).toBe("delivered");
		expect(res.headline).toContain("Yes — anyone can send as you@newstartup.io");
		expect(res.summary).toContain("No DMARC record is published");
	});

	it("Case 2: DMARC p=none -> spoofable (Yes)", () => {
		const res = evaluateSpoofability("acme.com", {
			spf: baseAuthSpf,
			dmarc: {
				published: true,
				policy: "none",
				subdomainPolicy: null,
				percentage: 100,
				rawRecord: "v=DMARC1; p=none; rua=mailto:reports@acme.com",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("spoofable");
		expect(res.spoofable).toBe(true);
		expect(res.inboxOutcome).toBe("delivered");
		expect(res.headline).toContain("Yes — anyone can send as you@acme.com");
		expect(res.summary).toContain("p=none");
	});

	it("Case 3: DMARC p=quarantine -> partially_protected (Sometimes)", () => {
		const res = evaluateSpoofability("acme.com", {
			spf: baseAuthSpf,
			dmarc: {
				published: true,
				policy: "quarantine",
				subdomainPolicy: null,
				percentage: 100,
				rawRecord: "v=DMARC1; p=quarantine; pct=100",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("partially_protected");
		expect(res.spoofable).toBe(true);
		expect(res.inboxOutcome).toBe("spam");
		expect(res.headline).toContain("Sometimes");
	});

	it("Case 4: DMARC p=reject with SPF -> protected (No)", () => {
		const res = evaluateSpoofability("stripe.com", {
			spf: baseAuthSpf,
			dmarc: {
				published: true,
				policy: "reject",
				subdomainPolicy: null,
				percentage: 100,
				rawRecord: "v=DMARC1; p=reject; pct=100",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("protected");
		expect(res.spoofable).toBe(false);
		expect(res.inboxOutcome).toBe("rejected");
		expect(res.headline).toContain("No — receivers are told to reject fakes as you@stripe.com");
	});

	it("Case 5: p=reject but pct=50 -> partially_protected (Sometimes)", () => {
		const res = evaluateSpoofability("acme.com", {
			spf: baseAuthSpf,
			dmarc: {
				published: true,
				policy: "reject",
				subdomainPolicy: null,
				percentage: 50,
				rawRecord: "v=DMARC1; p=reject; pct=50",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("partially_protected");
		expect(res.inboxOutcome).toBe("spam");
		expect(res.summary).toContain("50%");
	});

	it("Case 6: SPF +all -> spoofable (Yes, even with p=reject)", () => {
		const res = evaluateSpoofability("badspf.com", {
			spf: {
				...baseAuthSpf,
				qualifier: "+all",
				rawRecord: "v=spf1 +all",
			},
			dmarc: {
				published: true,
				policy: "reject",
				subdomainPolicy: null,
				percentage: 100,
				rawRecord: "v=DMARC1; p=reject",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("spoofable");
		expect(res.spoofable).toBe(true);
		expect(res.inboxOutcome).toBe("delivered");
		expect(res.headline).toContain("Yes — anyone can send as you@badspf.com");
		expect(res.summary).toContain("+all");
	});

	it("Case 8: Good DMARC p=reject with no SPF -> partially_protected", () => {
		const res = evaluateSpoofability("nospf.com", {
			spf: {
				status: "fail",
				published: false,
				rawRecord: null,
				qualifier: null,
				lookupCount: 0,
				mechanisms: [],
				includes: [],
				ip4: [],
				ip6: [],
				warnings: [],
			},
			dmarc: {
				published: true,
				policy: "reject",
				subdomainPolicy: null,
				percentage: 100,
				rawRecord: "v=DMARC1; p=reject",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("partially_protected");
		expect(res.summary).toContain("no SPF record was found");
	});

	it("Case 9: Subdomain hole sp=none on root domain", () => {
		const res = evaluateSpoofability("acme.com", {
			spf: baseAuthSpf,
			dmarc: {
				published: true,
				policy: "reject",
				subdomainPolicy: "none",
				percentage: 100,
				rawRecord: "v=DMARC1; p=reject; sp=none",
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("protected");
		expect(res.subdomainNote).toContain("subdomains have 'sp=none'");
		expect(res.reasons.some((r) => r.id === "subdomain-hole")).toBe(true);
	});

	it("Case 16: Multiple DMARC records -> spoofable (Yes)", () => {
		const res = evaluateSpoofability("twodmarc.com", {
			spf: baseAuthSpf,
			dmarc: {
				published: true,
				policy: "reject",
				subdomainPolicy: null,
				percentage: 100,
				rawRecord: "v=DMARC1; p=reject",
				warnings: ["Multiple DMARC records found."],
			},
			dkim: baseDkim,
			mx: baseMx,
		});

		expect(res.verdict).toBe("spoofable");
		expect(res.summary).toContain("Multiple DMARC records");
	});
});
