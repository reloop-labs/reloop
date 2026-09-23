import { describe, expect, test } from "bun:test";
import {
	checkDkimRecord,
	checkSpfRecord,
	classifyDnsError,
	dkimRecordMatches,
	dmarcRecordMatches,
	mxRecordMatches,
	normalizeMxLookupName,
	spfRecordMatches,
} from "@reloop/dns/verify-records";

describe("spfRecordMatches", () => {
	test("accepts an SPF record that still includes the required host", () => {
		expect(
			spfRecordMatches(
				["v=spf1 include:reloop.sh -all"],
				"v=spf1 include:reloop.sh -all",
			),
		).toBe(true);
	});

	test("rejects a record after the include is removed", () => {
		expect(
			spfRecordMatches(["v=spf1 -all"], "v=spf1 include:reloop.sh -all"),
		).toBe(false);
	});
});

describe("dkimRecordMatches", () => {
	test("matches the published public key", () => {
		expect(
			dkimRecordMatches("v=DKIM1; k=rsa; p=abc123", "v=DKIM1; k=rsa; p=abc123"),
		).toBe(true);
	});

	test("rejects a replaced key", () => {
		expect(
			dkimRecordMatches("v=DKIM1; k=rsa; p=other", "v=DKIM1; k=rsa; p=abc123"),
		).toBe(false);
	});
});

describe("dmarcRecordMatches", () => {
	test("requires each expected tag", () => {
		expect(
			dmarcRecordMatches(
				"v=DMARC1; p=none; rua=mailto:dmarc@example.com",
				"v=DMARC1; p=none",
			),
		).toBe(true);
		expect(dmarcRecordMatches("v=DMARC1", "v=DMARC1; p=none")).toBe(false);
	});
});

describe("mxRecordMatches", () => {
	test("requires the exact exchange and priority", () => {
		expect(
			mxRecordMatches(
				[{ exchange: "inbound.reloop.sh", priority: 10 }],
				"inbound.reloop.sh",
				10,
			),
		).toBe(true);
		expect(
			mxRecordMatches(
				[{ exchange: "reloop.sh", priority: 10 }],
				"inbound.reloop.sh",
				10,
			),
		).toBe(false);
	});
});

describe("normalizeMxLookupName", () => {
	test("strips a legacy apex prefix", () => {
		expect(normalizeMxLookupName("@.example.com")).toBe("example.com");
	});
});

describe("live check outcomes", () => {
	test("treats a missing record as a mismatch", async () => {
		const outcome = await checkSpfRecord(
			"send.example.com",
			"v=spf1 include:reloop.sh -all",
			async () => {
				throw Object.assign(new Error("not found"), { code: "ENOTFOUND" });
			},
		);
		expect(outcome).toBe("mismatch");
	});

	test("treats a resolver timeout as a lookup failure", async () => {
		const outcome = await checkDkimRecord(
			"reloop._domainkey.example.com",
			"v=DKIM1; p=abc",
			async () => {
				throw Object.assign(new Error("DNS query timeout"), {
					code: "ETIMEOUT",
				});
			},
		);
		expect(outcome).toBe("lookup_failed");
	});

	test("classifies NXDOMAIN separately from a timeout", () => {
		expect(classifyDnsError({ code: "ENODATA" })).toBe("mismatch");
		expect(classifyDnsError({ code: "ETIMEOUT" })).toBe("lookup_failed");
	});
});
