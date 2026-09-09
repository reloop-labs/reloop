import { describe, expect, test } from "bun:test";
import type { DNSRecord } from "#/features/domain/types";
import { groupDomainDnsRecords } from "./dns-record-groups";

function rec(
	partial: Pick<DNSRecord, "id" | "recordTypeName" | "purpose"> &
		Partial<DNSRecord>,
): DNSRecord {
	return {
		recordType: partial.recordTypeName === "MX" ? "MX" : "TXT",
		name: "@",
		fqdn: "example.com",
		value: "x",
		ttl: "Auto",
		priority: null,
		verificationError: null,
		status: "pending",
		domain: "example.com",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...partial,
	};
}

describe("groupDomainDnsRecords", () => {
	test("sending group is SPF only — MX belongs to receiving", () => {
		const grouped = groupDomainDnsRecords([
			rec({ id: "spf", recordTypeName: "SPF", purpose: "sending" }),
			rec({ id: "send-mx", recordTypeName: "MX", purpose: "sending" }),
			rec({ id: "recv-mx", recordTypeName: "MX", purpose: "receiving" }),
			rec({ id: "dkim", recordTypeName: "DKIM", purpose: "sending" }),
		]);

		expect(grouped.sendingRecords.map((r) => r.id)).toEqual(["spf"]);
		expect(grouped.receivingRecords.map((r) => r.id)).toEqual(["recv-mx"]);
		expect(grouped.dkimRecords.map((r) => r.id)).toEqual(["dkim"]);
	});
});
