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
	| "pending"
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
): "MX" | "SPF" | "DKIM" | "DMARC" | "CNAME" {
	const upperRecordType = recordType.toUpperCase();

	if (upperRecordType === "MX") {
		return "MX";
	}

	if (upperRecordType === "CNAME") {
		return "CNAME";
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
	throw new Error(
		`Unable to determine recordTypeName for recordType: ${recordType}, value: ${value}`,
	);
}

export function getRecordPurpose(
	recordTypeName: "MX" | "SPF" | "DKIM" | "DMARC" | "CNAME",
	name: string,
	domain: string,
): "sending" | "receiving" | "tracking" {
	switch (recordTypeName) {
		case "MX": {
			const cleanName = name.trim().toLowerCase();
			const cleanDomain = domain.trim().toLowerCase();
			if (cleanName === "@" || cleanName === "" || cleanName === cleanDomain) {
				return "sending";
			}
			return "receiving";
		}
		case "SPF":
		case "DKIM":
		case "DMARC":
			return "sending";
		case "CNAME":
			return "tracking";
		default:
			return "sending";
	}
}

export async function insertDNSRecords(
	dnsRecordData: DNSRecordData[],
	domain: string,
	organizationId: string,
	userId: string,
	domainId: string,
): Promise<void> {
	for (const record of dnsRecordData) {
		const recordTypeName = getRecordTypeName(record.recordType, record.value);
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
			recordTypeName,
			purpose: getRecordPurpose(recordTypeName, record.name, domain),
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
