import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { DNSTypes } from "@reloop/domain/types/dns.type";
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
	fqdn: string;
	value: string;
	ttl: string;
	priority?: number;
	status: DNSRecordStatus;
}

/**
 * Maps recordType and value to recordTypeName enum value
 */
export function getRecordTypeName(
	recordType: string,
	value: string,
): "MX" | "SPF" | "DKIM" | "DMARC" {
	const upperRecordType = recordType.toUpperCase();

	if (upperRecordType === "MX") {
		return "MX";
	}

	if (upperRecordType === "TXT") {
		if (value.startsWith("v=spf1")) {
			return "SPF";
		}
		if (value.startsWith("v=DKIM1")) {
			return "DKIM";
		}
		if (value.startsWith("v=DMARC1")) {
			return "DMARC";
		}
	}

	// Default fallback - try to infer from recordType if it's already a type name
	if (
		upperRecordType === "SPF" ||
		upperRecordType === "DKIM" ||
		upperRecordType === "DMARC"
	) {
		return upperRecordType as "SPF" | "DKIM" | "DMARC";
	}

	// Default to SPF if we can't determine (shouldn't happen in practice)
	throw new Error(
		`Unable to determine recordTypeName for recordType: ${recordType}, value: ${value}`,
	);
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
			recordType: record.recordType as "A" | "AAAA" | "CNAME" | "MX" | "TXT",
			name: record.name,
			fqdn: record.fqdn,
			value: record.value,
			ttl: record.ttl,
			priority: record.priority,
			status: record.status,
			recordTypeName: getRecordTypeName(record.recordType, record.value),
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
