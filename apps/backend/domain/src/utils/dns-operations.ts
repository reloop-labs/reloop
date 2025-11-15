import type { DNSTypes } from "@be/domain/types/dns.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export interface GeneratedDNSData {
	dkimKeyPair: DNSTypes.DKIMKeyPair;
	spfRecord: string;
	dkimRecord: string;
	dmarcRecord: string;
	mxRecord: string;
}

export type DNSRecordStatus =
	| "start-verify"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export interface DNSRecordData {
	recordType: string;
	name: string;
	value: string;
	ttl: number;
	priority?: number;
	status: DNSRecordStatus;
}

export async function insertDNSRecords(
	dnsRecordData: DNSRecordData[],
	domain: string,
	organizationId: string,
	userId: string,
	domainId: string,
): Promise<void> {
	for (const record of dnsRecordData) {
		await db.insert(schema.domainDnsRecord).values({
			domainId,
			organizationId,
			userId,
			recordType: record.recordType as
				| "A"
				| "AAAA"
				| "CNAME"
				| "MX"
				| "TXT"
				| "NS"
				| "SRV"
				| "CAA"
				| "SPF"
				| "DKIM"
				| "DMARC",
			name: record.name,
			value: record.value,
			ttl: record.ttl,
			priority: record.priority,
			status: record.status,
			domain,
		});
	}
}

export async function getExistingDNSRecords(params: {
	domain: string;
	organizationId: string;
}): Promise<{
	spfRecord: string;
	dkimRecord: string;
	dmarcRecord: string;
	mxRecord: string;
} | null> {
	const { domain, organizationId } = params;
	const existingRecords = await db.query.domainDnsRecord.findMany({
		where: and(
			eq(schema.domainDnsRecord.domain, domain),
			eq(schema.domainDnsRecord.organizationId, organizationId),
			isNull(schema.domainDnsRecord.deletedAt),
		),
	});

	if (existingRecords.length < 4) return null;

	const mxRecord = existingRecords.find(
		(r) => r.recordType === "MX" && r.value.includes("reloop.sh"),
	);
	const spfRecord = existingRecords.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=spf1"),
	);
	const dkimRecord = existingRecords.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=DKIM1"),
	);
	const dmarcRecord = existingRecords.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=DMARC1"),
	);

	return {
		spfRecord: spfRecord?.value || "",
		dkimRecord: dkimRecord?.value || "",
		dmarcRecord: dmarcRecord?.value || "",
		mxRecord: mxRecord?.value || "",
	};
}
