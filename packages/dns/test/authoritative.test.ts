import { describe, expect, test } from "bun:test";
import { candidateZones } from "@reloop/dns/authoritative";
import {
	checkDkimRecord,
	checkSpfRecord,
	combineOutcomes,
} from "@reloop/dns/verify-records";

describe("candidateZones", () => {
	test("walks up from the record name, nearest zone first, without the TLD", () => {
		expect(candidateZones("reloop._domainkey.mail.example.co.uk.")).toEqual([
			"reloop._domainkey.mail.example.co.uk",
			"_domainkey.mail.example.co.uk",
			"mail.example.co.uk",
			"example.co.uk",
			"co.uk",
		]);
	});

	test("returns nothing for a bare TLD", () => {
		expect(candidateZones("com")).toEqual([]);
	});
});

describe("combineOutcomes", () => {
	test("any match wins", () => {
		expect(combineOutcomes(["lookup_failed", "match"])).toBe("match");
	});

	test("lookup_failed only when every source failed", () => {
		expect(combineOutcomes(["lookup_failed", "lookup_failed"])).toBe(
			"lookup_failed",
		);
		expect(combineOutcomes(["lookup_failed", "mismatch"])).toBe("mismatch");
	});
});

describe("live authoritative checks", () => {
	test("SPF on a real zone matches via nameservers", async () => {
		expect(
			await checkSpfRecord("google.com", "v=spf1 include:_spf.google.com ~all"),
		).toBe("match");
	});

	test("missing DKIM is a mismatch, not a lookup failure", async () => {
		expect(
			await checkDkimRecord(
				"nope-reloop-test._domainkey.google.com",
				"v=DKIM1; k=rsa; p=abc",
			),
		).toBe("mismatch");
	});
});
