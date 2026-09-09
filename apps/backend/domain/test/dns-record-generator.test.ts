import { describe, expect, test } from "bun:test";
import { DNSTypes } from "../src/types/dns.type";
import {
	generateAllDNSRecords,
	generateMXRecord,
	generateReceivingMXRecordForDomain,
} from "../src/utils/dns-record-generator";
import {
	getDomainHost,
	getDomainSubString,
	getReceivingMxName,
} from "../src/utils/domain-formatter";

describe("getReceivingMxName", () => {
	test("apex domain uses @", () => {
		expect(getReceivingMxName("example.com")).toBe("@");
	});

	test("subdomain product uses relative label", () => {
		expect(getReceivingMxName("mail.example.com")).toBe("mail");
	});
});

describe("generateMXRecord", () => {
	test("apex @ does not produce @.root FQDN", () => {
		const record = generateMXRecord("@", "example.com", "inbound.reloop.sh");
		expect(record.name).toBe("@");
		expect(record.fqdn).toBe("example.com");
		expect(record.value).toBe("inbound.reloop.sh");
		expect(record.priority).toBe(10);
	});

	test("subdomain label builds relative FQDN", () => {
		const record = generateMXRecord("send", "example.com", "reloop.sh");
		expect(record.name).toBe("send");
		expect(record.fqdn).toBe("send.example.com");
		expect(record.value).toBe("reloop.sh");
	});
});

describe("generateAllDNSRecords", () => {
	test("sending records are SPF, DKIM, and DMARC — no MX", async () => {
		const records = await generateAllDNSRecords("example.com");
		expect(records.spfRecord.type).toBe(DNSTypes.DNSRecordType.TXT);
		expect(records.spfRecord.value.startsWith("v=spf1")).toBe(true);
		expect(records.dmarcRecord.value.startsWith("v=DMARC1")).toBe(true);
		expect(records.dkimRecord.value.startsWith("v=DKIM1")).toBe(true);
		expect(records).not.toHaveProperty("mxRecord");
	});
});

describe("generateReceivingMXRecordForDomain", () => {
	test("apex receiving MX points domain → inbound.reloop.sh", () => {
		const record = generateReceivingMXRecordForDomain(
			"example.com",
			"reloop.sh",
		);
		expect(record.name).toBe("@");
		expect(record.fqdn).toBe("example.com");
		expect(record.value).toBe("inbound.reloop.sh");
		expect(getDomainHost("example.com")).toBe("example.com");
		expect(getDomainSubString("example.com")).toBe("@");
	});

	test("subdomain receiving MX is on that host", () => {
		const record = generateReceivingMXRecordForDomain(
			"mail.example.com",
			"reloop.sh",
		);
		expect(record.name).toBe("mail");
		expect(record.fqdn).toBe("mail.example.com");
		expect(record.value).toBe("inbound.reloop.sh");
	});
});
