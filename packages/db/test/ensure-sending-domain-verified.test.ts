import { describe, expect, test } from "bun:test";
import {
	blockedDetail,
	planDomainDnsChecks,
	provesDnsControl,
	summarizeDnsChecks,
} from "@reloop/db/ensure-sending-domain-verified";

const records = [
	{
		id: "dns_dkim",
		recordType: "TXT",
		value: "v=DKIM1; p=abc",
		fqdn: "reloop._domainkey.example.com",
		priority: null,
		purpose: "sending",
	},
	{
		id: "dns_spf",
		recordType: "TXT",
		value: "v=spf1 include:reloop.sh -all",
		fqdn: "example.com",
		priority: null,
		purpose: "sending",
	},
	{
		id: "dns_dmarc",
		recordType: "TXT",
		value: "v=DMARC1; p=none",
		fqdn: "_dmarc.example.com",
		priority: null,
		purpose: "sending",
	},
	{
		id: "dns_cname",
		recordType: "CNAME",
		value: "link.reloop.sh",
		fqdn: "link.example.com",
		priority: null,
		purpose: "tracking",
	},
];

const sendingFlags = {
	isSendingEmailEnabled: true,
	isReceivingEmailEnabled: false,
	isClickTrackingEnabled: true,
	isOpenTrackingEnabled: false,
};

describe("planDomainDnsChecks", () => {
	test("plans every record required to keep a sending domain verified", () => {
		const plan = planDomainDnsChecks(records, sendingFlags);
		expect(plan.missingConfig).toEqual([]);
		expect(plan.checks.map((check) => check.label)).toEqual([
			"DKIM",
			"SPF",
			"DMARC",
			"CNAME",
		]);
	});

	test("reports records that are no longer stored", () => {
		const plan = planDomainDnsChecks(
			records.filter((record) => record.id !== "dns_spf"),
			sendingFlags,
		);
		expect(plan.missingConfig).toEqual(["SPF"]);
		expect(plan.checks.map((check) => check.label)).not.toContain("SPF");
	});

	test("relay domains need no Reloop sending DNS", () => {
		const relayFlags = { ...sendingFlags, usesExternalRelay: true };
		const stored = planDomainDnsChecks(records, relayFlags);
		expect(stored.missingConfig).toEqual([]);
		expect(stored.checks.map((check) => check.label)).toEqual(["CNAME"]);

		const bare = planDomainDnsChecks([], {
			...relayFlags,
			isClickTrackingEnabled: false,
		});
		expect(bare.missingConfig).toEqual([]);
		expect(bare.checks).toEqual([]);
	});
});

describe("ownership TXT", () => {
	const ownership = {
		id: "dns_owner",
		recordType: "TXT",
		value: "reloop-verification=abc123",
		fqdn: "_reloop-verification.example.com",
		priority: null,
		purpose: "sending",
	};

	test("is checked first when the domain is contested", () => {
		const plan = planDomainDnsChecks([ownership, ...records], sendingFlags);
		expect(plan.checks.map((check) => check.label)).toEqual([
			"OWNERSHIP",
			"DKIM",
			"SPF",
			"DMARC",
			"CNAME",
		]);
	});

	test("is still required for relay domains", () => {
		const plan = planDomainDnsChecks([ownership], {
			...sendingFlags,
			isClickTrackingEnabled: false,
			usesExternalRelay: true,
		});
		expect(plan.checks.map((check) => check.label)).toEqual(["OWNERSHIP"]);
	});

	test("is not mistaken for SPF, DMARC or DKIM", () => {
		const plan = planDomainDnsChecks([ownership], sendingFlags);
		expect(plan.missingConfig).toEqual(["DKIM", "SPF", "DMARC", "CNAME"]);
	});
});

describe("provesDnsControl", () => {
	test("only a per-org record (DKIM or ownership) proves control", () => {
		expect(provesDnsControl([{ label: "DKIM", outcome: "match" }])).toBe(true);
		expect(provesDnsControl([{ label: "OWNERSHIP", outcome: "match" }])).toBe(
			true,
		);
	});

	test("shared records every org publishes prove nothing", () => {
		expect(
			provesDnsControl([
				{ label: "SPF", outcome: "match" },
				{ label: "DMARC", outcome: "match" },
				{ label: "MX", outcome: "match" },
				{ label: "CNAME", outcome: "match" },
			]),
		).toBe(false);
		// A relay domain with nothing to check passes vacuously; it must not
		// take the domain from another org.
		expect(provesDnsControl([])).toBe(false);
		expect(provesDnsControl([{ label: "DKIM", outcome: "mismatch" }])).toBe(
			false,
		);
	});
});

describe("summarizeDnsChecks", () => {
	test("fails closed when a published record no longer matches", () => {
		expect(
			summarizeDnsChecks({
				missingConfig: [],
				results: [
					{ label: "DKIM", outcome: "match" },
					{ label: "SPF", outcome: "mismatch" },
					{ label: "DMARC", outcome: "match" },
				],
			}),
		).toEqual({
			ok: false,
			code: "unverified",
			missing: ["SPF"],
			reason: "Your SPF record is missing or incorrect",
			transient: false,
		});
	});

	test("does not mark the domain unverified when DNS itself times out", () => {
		expect(
			summarizeDnsChecks({
				missingConfig: [],
				results: [
					{ label: "DKIM", outcome: "match" },
					{ label: "SPF", outcome: "lookup_failed" },
				],
			}),
		).toEqual({
			ok: false,
			code: "lookup_failed",
			missing: ["SPF"],
			transient: true,
		});
	});
});

describe("blockedDetail", () => {
	test("appends the admin message for the customer", () => {
		expect(
			blockedDetail("example.com", "  Phishing report under review.  "),
		).toBe(
			"Email was not sent. Sending from example.com has been blocked. Phishing report under review.",
		);
	});

	test("falls back to the base sentence without a message", () => {
		expect(blockedDetail("example.com", null)).toBe(
			"Email was not sent. Sending from example.com has been blocked.",
		);
		expect(blockedDetail("example.com", "   ")).toBe(
			"Email was not sent. Sending from example.com has been blocked.",
		);
	});
});
