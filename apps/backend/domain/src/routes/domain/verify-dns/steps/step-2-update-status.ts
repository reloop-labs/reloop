import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function updateStatusToVerifying_step2({
	domainId,
	domain,
}: {
	domainId: string;
	domain: typeof schema.domain.$inferSelect & {
		dnsRecords: (typeof schema.domainDnsRecord.$inferSelect)[];
	};
}) {
	const log = useLogger();
	log.info("Updating domain status to verifying");
	await db
		.update(schema.domain)
		.set({ status: "verifying" })
		.where(eq(schema.domain.id, domainId));

	log.info(
		"Updating active DNS records status to verifying, and inactive to pending",
	);

	const activeRecordIds = new Set<string>();

	// Find mandatory DKIM verification record
	const dkimRecord = domain.dnsRecords.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=DKIM1"),
	);
	if (dkimRecord) {
		activeRecordIds.add(dkimRecord.id);
	}

	const isSendingEnabled = domain.isSendingEmailEnabled;
	const spfRecord = isSendingEnabled
		? domain.dnsRecords.find(
			(r) => r.recordType === "TXT" && r.value.startsWith("v=spf1"),
		)
		: undefined;
	const dmarcRecord = isSendingEnabled
		? domain.dnsRecords.find(
			(r) => r.recordType === "TXT" && r.value.startsWith("v=DMARC1"),
		)
		: undefined;
	const sendingMxRecord = isSendingEnabled
		? domain.dnsRecords.find(
			(r: any) => r.recordType === "MX" && r.purpose === "sending",
		)
		: undefined;

	if (isSendingEnabled && spfRecord && dmarcRecord) {
		activeRecordIds.add(spfRecord.id);
		activeRecordIds.add(dmarcRecord.id);
	}
	if (isSendingEnabled && sendingMxRecord) {
		activeRecordIds.add(sendingMxRecord.id);
	}

	const isReceivingEnabled = domain.isReceivingEmailEnabled;
	const receivingMxRecord = isReceivingEnabled
		? (domain.dnsRecords.find(
			(r) => r.recordType === "MX" && r.purpose === "receiving",
		) ??
			domain.dnsRecords.find(
				(r: any) => r.recordType === "MX" && r.purpose === "sending",
			))
		: undefined;

	if (isReceivingEnabled && receivingMxRecord) {
		activeRecordIds.add(receivingMxRecord.id);
	}

	const isTrackingEnabled =
		domain.isClickTrackingEnabled || domain.isOpenTrackingEnabled;
	const cnameRecord = isTrackingEnabled
		? domain.dnsRecords.find((r) => r.recordType === "CNAME")
		: undefined;

	if (isTrackingEnabled && cnameRecord) {
		activeRecordIds.add(cnameRecord.id);
	}

	const activeIdsArray = Array.from(activeRecordIds);
	const inactiveRecordIds = domain.dnsRecords
		.map((r) => r.id)
		.filter((id: string) => !activeRecordIds.has(id));

	if (activeIdsArray.length > 0) {
		await db
			.update(schema.domainDnsRecord)
			.set({ status: "verifying" })
			.where(
				and(
					eq(schema.domainDnsRecord.domainId, domainId),
					inArray(schema.domainDnsRecord.id, activeIdsArray),
				),
			);
	}

	if (inactiveRecordIds.length > 0) {
		await db
			.update(schema.domainDnsRecord)
			.set({ status: "pending", verificationError: null })
			.where(
				and(
					eq(schema.domainDnsRecord.domainId, domainId),
					inArray(schema.domainDnsRecord.id, inactiveRecordIds),
				),
			);
	}

	return { success: true };
}
