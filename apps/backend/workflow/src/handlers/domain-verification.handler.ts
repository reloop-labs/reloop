import {
	verifyCnameRecord,
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/workflow/utils/verify-dns-records";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

function buildFailureReason(checks: Record<string, boolean>): string {
	return Object.entries(checks)
		.map(([name, ok]) => `${name}=${ok}`)
		.join(" ");
}

async function markDomainFailed(
	domainId: string,
	reason: string,
): Promise<void> {
	await db
		.update(schema.domain)
		.set({
			status: "failed",
			systemVerified: false,
			verificationFailedReason: reason,
		})
		.where(eq(schema.domain.id, domainId));
}

export async function processDomainVerification({
	domainId,
	organizationId,
	isLastAttempt,
}: {
	domainId: string;
	organizationId: string;
	isLastAttempt: boolean;
}): Promise<void> {
	log.info({ message: "Processing domain verification job", domainId });

	// Fetch domain with DNS records
	const domainWithRecords = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.id, domainId),
			eq(schema.domain.organizationId, organizationId),
			isNull(schema.domain.deletedAt),
		),
		with: {
			dnsRecords: {
				where: isNull(schema.domainDnsRecord.deletedAt),
			},
		},
	});

	if (!domainWithRecords) {
		log.error({ message: "Domain not found", domainId });
		return;
	}

	const domainName = domainWithRecords.domain;
	const records = domainWithRecords.dnsRecords;
	log.info({ message: "Fetched DNS records from database", domainId, records });

	// Find mandatory DKIM verification record
	const dkimRecord = records.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=DKIM1"),
	);

	if (!dkimRecord) {
		log.warn({
			message: "Missing mandatory DKIM record for verification",
			domainId,
		});
		await markDomainFailed(domainId, "Missing mandatory DKIM record");
		return;
	}

	// Conditionally verify SPF and DMARC (Enable Sending)
	const isSendingEnabled = domainWithRecords.isSendingEmailEnabled;
	const spfRecord = isSendingEnabled
		? records.find(
				(r) => r.recordType === "TXT" && r.value.startsWith("v=spf1"),
			)
		: undefined;
	const dmarcRecord = isSendingEnabled
		? records.find(
				(r) => r.recordType === "TXT" && r.value.startsWith("v=DMARC1"),
			)
		: undefined;
	const sendingMxRecord = isSendingEnabled
		? records.find((r) => r.recordType === "MX" && r.purpose === "sending")
		: undefined;

	if (isSendingEnabled && (!spfRecord || !dmarcRecord || !sendingMxRecord)) {
		const missing = [
			!spfRecord && "SPF",
			!dmarcRecord && "DMARC",
			!sendingMxRecord && "sending MX",
		]
			.filter(Boolean)
			.join(", ");
		log.warn({
			message:
				"Missing SPF, DMARC, or sending MX record when sending is enabled",
			domainId,
		});
		await markDomainFailed(
			domainId,
			`Missing required records when sending is enabled: ${missing}`,
		);
		return;
	}

	// Conditionally verify MX (Enable Receiving)
	const isReceivingEnabled = domainWithRecords.isReceivingEmailEnabled;
	const receivingMxRecord = isReceivingEnabled
		? (records.find(
				(r) => r.recordType === "MX" && r.purpose === "receiving",
			) ??
			records.find((r) => r.recordType === "MX" && r.purpose === "sending"))
		: undefined;

	if (isReceivingEnabled && !receivingMxRecord) {
		log.warn({
			message: "Missing receiving MX record when receiving is enabled",
			domainId,
		});
		await markDomainFailed(
			domainId,
			"Missing receiving MX record when receiving is enabled",
		);
		return;
	}

	// Conditionally verify CNAME (Tracking)
	const isTrackingEnabled =
		domainWithRecords.isClickTrackingEnabled ||
		domainWithRecords.isOpenTrackingEnabled;
	const cnameRecord = isTrackingEnabled
		? records.find((r) => r.recordType === "CNAME")
		: undefined;

	if (isTrackingEnabled && !cnameRecord) {
		log.warn({
			message: "Missing CNAME record when tracking is enabled",
			domainId,
		});
		await markDomainFailed(
			domainId,
			"Missing CNAME record when tracking is enabled",
		);
		return;
	}

	// Compile active verifications dynamically
	const activeResults: { record: any; verifyFn: () => Promise<boolean> }[] = [];

	activeResults.push({
		record: dkimRecord,
		verifyFn: () => verifyDkimRecord(dkimRecord.fqdn, dkimRecord.value),
	});

	if (isSendingEnabled && spfRecord && dmarcRecord) {
		activeResults.push({
			record: spfRecord,
			verifyFn: () => verifySpfRecord(spfRecord.fqdn, spfRecord.value),
		});
		activeResults.push({
			record: dmarcRecord,
			verifyFn: () => verifyDmarcRecord(dmarcRecord.fqdn, dmarcRecord.value),
		});
	}

	if (isSendingEnabled && sendingMxRecord) {
		activeResults.push({
			record: sendingMxRecord,
			verifyFn: () =>
				verifyMxRecord(
					sendingMxRecord.fqdn,
					sendingMxRecord.value,
					sendingMxRecord.priority ?? 10,
				),
		});
	}

	if (isReceivingEnabled && receivingMxRecord) {
		if (!sendingMxRecord || receivingMxRecord.id !== sendingMxRecord.id) {
			activeResults.push({
				record: receivingMxRecord,
				verifyFn: () =>
					verifyMxRecord(
						receivingMxRecord.fqdn,
						receivingMxRecord.value,
						receivingMxRecord.priority ?? 10,
					),
			});
		}
	}

	if (isTrackingEnabled && cnameRecord) {
		activeResults.push({
			record: cnameRecord,
			verifyFn: () => verifyCnameRecord(cnameRecord.fqdn, cnameRecord.value),
		});
	}

	const verificationResults = await Promise.all(
		activeResults.map((item) => item.verifyFn()),
	);

	const results = activeResults.map((item, index) => ({
		record: item.record,
		ok: verificationResults[index],
	}));

	const dkimOk =
		results.find((r) => r.record.id === dkimRecord.id)?.ok ?? false;
	const spfOk = spfRecord
		? (results.find((r) => r.record.id === spfRecord.id)?.ok ?? false)
		: true;
	const dmarcOk = dmarcRecord
		? (results.find((r) => r.record.id === dmarcRecord.id)?.ok ?? false)
		: true;
	const sendingMxOk = sendingMxRecord
		? (results.find((r) => r.record.id === sendingMxRecord.id)?.ok ?? false)
		: true;
	const receivingMxOk = receivingMxRecord
		? (results.find((r) => r.record.id === receivingMxRecord.id)?.ok ?? false)
		: true;
	const mxOk = sendingMxOk && receivingMxOk;
	const cnameOk = cnameRecord
		? (results.find((r) => r.record.id === cnameRecord.id)?.ok ?? false)
		: true;

	log.info({
		message: "DNS verification results",
		domainId,
		domainName,
		dkimOk,
		spfOk,
		dmarcOk,
		mxOk,
		cnameOk,
	});

	const activeRecordIds = new Set(activeResults.map((item) => item.record.id));
	const inactiveRecords = records.filter((r) => !activeRecordIds.has(r.id));

	// Update individual record statuses
	await Promise.all([
		...results.map(({ record, ok }) => {
			if (!ok && !isLastAttempt) return Promise.resolve();

			return db
				.update(schema.domainDnsRecord)
				.set({ status: ok ? "active" : "failed" })
				.where(eq(schema.domainDnsRecord.id, record.id));
		}),
		...inactiveRecords.map((record) =>
			db
				.update(schema.domainDnsRecord)
				.set({ status: "pending", verificationError: null })
				.where(eq(schema.domainDnsRecord.id, record.id)),
		),
	]);

	const allPassed = dkimOk && spfOk && dmarcOk && mxOk && cnameOk;
	const failureReason = buildFailureReason({
		DKIM: dkimOk,
		SPF: spfOk,
		DMARC: dmarcOk,
		MX: mxOk,
		CNAME: cnameOk,
	});

	if (allPassed) {
		await db
			.update(schema.domain)
			.set({
				status: "active",
				systemVerified: true,
				userVerifiedDomain: true,
				lastVerifiedAt: new Date(),
				verificationFailedReason: null,
				isTrackingDomain: cnameOk && isTrackingEnabled,
			})
			.where(eq(schema.domain.id, domainId));

		await bus.publish(BusEvent.DOMAIN_VERIFIED, {
			domainId,
			domain: domainName,
			organizationId,
		});

		log.info({ message: "Domain verified successfully", domainId, domainName });
		return;
	}

	if (isLastAttempt) {
		await db
			.update(schema.domain)
			.set({
				status: "failed",
				systemVerified: false,
				verificationFailedReason: failureReason,
				isTrackingDomain: false,
			})
			.where(eq(schema.domain.id, domainId));

		log.warn({
			message:
				"Domain verification failed — one or more DNS records did not match",
			domainId,
			domainName,
			dkimOk,
			spfOk,
			dmarcOk,
			mxOk,
			cnameOk,
		});
		// Do not throw after final failure write — status is already persisted
		return;
	}

	log.warn({
		message:
			"Domain verification failed — one or more DNS records did not match",
		domainId,
		domainName,
		dkimOk,
		spfOk,
		dmarcOk,
		mxOk,
		cnameOk,
	});

	throw new Error(
		`Verification failed for ${domainName}: ${failureReason}`,
	);
}
