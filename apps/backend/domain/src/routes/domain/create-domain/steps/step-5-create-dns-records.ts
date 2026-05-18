import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { DNSTypes } from "@reloop/domain/types/dns.type";

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
	const log = useLogger();
	const { dkimRecord, spfRecord, dmarcRecord, mxRecord } = dnsRecords;

	const dnsRecordIds = {
		domainId,
		organizationId,
		userId,
		domain,
	};

	log.info("Creating DNS records");

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
			purpose: "sending",
		},
		{
			...dnsRecordIds,
			recordType: spfRecord.type,
			name: spfRecord.name,
			fqdn: spfRecord.fqdn,
			value: spfRecord.value,
			recordTypeName: "SPF" as const,
			purpose: "sending",
		},
		{
			...dnsRecordIds,
			recordType: dmarcRecord.type,
			name: dmarcRecord.name,
			fqdn: dmarcRecord.fqdn,
			value: dmarcRecord.value,
			recordTypeName: "DMARC" as const,
			purpose: "sending",
		},
		{
			...dnsRecordIds,
			recordType: mxRecord.type,
			name: mxRecord.name,
			fqdn: mxRecord.fqdn,
			value: mxRecord.value,
			recordTypeName: "MX" as const,
			priority: mxRecord.priority,
			purpose: "receiving",
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
			purpose: "receiving",
		});
	}

	await db.insert(schema.domainDnsRecord).values(recordsToInsert);

	return { success: true };
}
