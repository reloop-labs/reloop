import type { DNSTypes } from "@be/domain/routes/dns/dns.type";
import { generateDKIMKeyPair } from "@be/domain/utils/dkim-key-generator";
import {
	generateAllDNSRecords,
	generateDKIMRecord,
} from "@be/domain/utils/dns-record-generator";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
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
	description?: string;
	isVerified: boolean;
	status: DNSRecordStatus;
}

export async function generateDNSRecords(
	domain: string,
): Promise<GeneratedDNSData> {
	const dkimKeyPair = await generateDKIMKeyPair();
	const dnsRecords = generateAllDNSRecords(domain);
	const dkimRecord = generateDKIMRecord(domain, dkimKeyPair.publicKey);
	dnsRecords.push(dkimRecord);
	const spfValue =
		dnsRecords.find((r) => r.value.startsWith("v=spf1"))?.value || "";
	const dkimValue =
		dnsRecords.find((r) => r.value.startsWith("v=DKIM1"))?.value || "";
	const dmarcValue =
		dnsRecords.find((r) => r.value.startsWith("v=DMARC1"))?.value || "";
	const mxValue = dnsRecords.find((r) => r.type === "MX")?.value || "";
	return {
		dkimKeyPair,
		spfRecord: spfValue,
		dkimRecord: dkimValue,
		dmarcRecord: dmarcValue,
		mxRecord: mxValue,
	};
}

export async function insertDNSRecords(
	dnsRecordData: DNSRecordData[],
	dkimKeyPair: DNSTypes.DKIMKeyPair,
	domain: string,
	organizationId: string,
	userId: string,
	domainId: string,
): Promise<void> {
	logger.info(
		{
			domain,
			organizationId,
			userId,
			recordCount: dnsRecordData.length,
		},
		"Inserting DNS records into database",
	);

	// Insert DNS records
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
			description: record.description,
			isVerified: record.isVerified,
			status: record.status,
			domain,
		});
	}

	// Update domain with DKIM selector
	await db
		.update(schema.domain)
		.set({
			dkimSelector: dkimKeyPair.selector,
			updatedAt: new Date(),
		})
		.where(eq(schema.domain.id, domainId));

	logger.info(
		{
			domain,
			recordCount: dnsRecordData.length,
		},
		"DNS records inserted successfully",
	);
}

/**
 * Converts DNS records to database format
 */
export function convertToDNSRecordData(
	dnsRecords: DNSTypes.DNSRecord[],
): DNSRecordData[] {
	return dnsRecords.map((record) => ({
		recordType: record.type,
		name: record.name,
		value: record.value,
		ttl: record.ttl || 3600,
		priority: record.priority,
		description: record.description,
		isVerified: false,
		status: "start-verify",
	}));
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
