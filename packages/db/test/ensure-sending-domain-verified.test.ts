import { describe, expect, test } from "bun:test";
import {
	planDomainDnsChecks,
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
