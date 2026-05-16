import { log } from "evlog";
import type { DNSTypes } from "@be/domain/types/dns.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { useLogger } from "evlog/elysia";

export async function createDnsRecords_step5({
	domainId,
	organizationId,
	userId,
	domain,
	dnsRecords,
	receivingMxRecord,
}: {
	domainId: string;
	organizationId: string;
	userId: string;
	domain: string;
	dnsRecords: {
		dkimRecord: DNSTypes.DNSRecord;
		spfRecord: DNSTypes.DNSRecord;
		dmarcRecord: DNSTypes.DNSRecord;
		mxRecord: DNSTypes.DNSRecord;
	};
	receivingMxRecord: DNSTypes.DNSRecord;
}) {
	const logger = useLogger();
	const { dkimRecord, spfRecord, dmarcRecord, mxRecord } = dnsRecords;

	const dnsRecordIds = {
		domainId,
		organizationId,
		userId,
		domain,
	};

	log.info({ ...({ dnsRecordIds }), message: "Creating DNS records" });

	const recordsToInsert: (typeof schema.domainDnsRecord.$inferInsert & {
		recordTypeName: "DKIM" | "SPF" | "DMARC" | "MX";
	})[] = [
			{
				...dnsRecordIds,
				recordType: dkimRecord.type,
				name: dkimRecord.name,
				fqdn: dkimRecord.fqdn,
				value: dkimRecord.value,
				priority: dkimRecord.priority,
				privateKey: dkimRecord.privateKey,
				recordTypeName: "DKIM" as const,
			},
			{
				...dnsRecordIds,
				recordType: spfRecord.type,
				name: spfRecord.name,
				fqdn: spfRecord.fqdn,
				value: spfRecord.value,
				recordTypeName: "SPF" as const,
			},
			{
				...dnsRecordIds,
				recordType: dmarcRecord.type,
				name: dmarcRecord.name,
				fqdn: dmarcRecord.fqdn,
				value: dmarcRecord.value,
				recordTypeName: "DMARC" as const,
			},
			{
				...dnsRecordIds,
				recordType: mxRecord.type,
				name: mxRecord.name,
				fqdn: mxRecord.fqdn,
				value: mxRecord.value,
				recordTypeName: "MX" as const,
				priority: mxRecord.priority,
			},
		];

	const hasDistinctReceivingMxRecord =
		receivingMxRecord.name !== mxRecord.name ||
		receivingMxRecord.value !== mxRecord.value ||
		receivingMxRecord.priority !== mxRecord.priority;

	if (hasDistinctReceivingMxRecord) {
		recordsToInsert.push({
			...dnsRecordIds,
			recordType: receivingMxRecord.type,
			name: receivingMxRecord.name,
			fqdn: receivingMxRecord.fqdn,
			value: receivingMxRecord.value,
			recordTypeName: "MX" as const,
			priority: receivingMxRecord.priority,
		});
	}

	await db.insert(schema.domainDnsRecord).values(recordsToInsert);

	return { success: true };
}
