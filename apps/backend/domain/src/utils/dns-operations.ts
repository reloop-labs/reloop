import type { DNSTypes } from "@be/domain/routes/dns/dns.type";
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

export async function generateDNSData(
	domain: string,
	serverDomain: string,
	dkimSelector = "mail",
): Promise<GeneratedDNSData> {
	logger.info(
		{
			domain,
			serverDomain,
			dkimSelector,
		},
		"Generating DNS data for domain",
	);

	const dkimKeyPair = await generateDKIMKeyPair(dkimSelector);
	const dnsRecords = generateAllDNSRecords(domain, serverDomain);
	const dkimRecord = generateDKIMRecord(
		domain,
		dkimSelector,
		dkimKeyPair.publicKey,
	);

	dnsRecords.push(dkimRecord);

	const spfValue =
		dnsRecords.find((r) => r.value.startsWith("v=spf1"))?.value || "";
	const dkimValue =
		dnsRecords.find((r) => r.value.startsWith("v=DKIM1"))?.value || "";
	const dmarcValue =
		dnsRecords.find((r) => r.value.startsWith("v=DMARC1"))?.value || "";

	return {
		dnsRecords,
		dkimKeyPair,
		spfRecord: spfValue,
		dkimRecord: dkimValue,
		dmarcRecord: dmarcValue,
	};
}

export async function insertDNSRecords(
	dnsRecordData: DNSRecordData[],
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

	await db
		.update(schema.domain)
		.set({
			dkimSelector: dkimKeyPair.selector,
			dkimPrivateKey: dkimKeyPair.privateKey,
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

export async function getExistingDNSRecords(
	domain: string,
	organizationId: string,
): Promise<{
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
