import {
	verifyCnameRecord,
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/workflow/utils/verify-dns-records";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

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
		await db
			.update(schema.domain)
			.set({ status: "failed" })
			.where(eq(schema.domain.id, domainId));
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

	if (isSendingEnabled && (!spfRecord || !dmarcRecord)) {
		log.warn({
			message: "Missing SPF or DMARC record when sending is enabled",
			domainId,
		});
		await db
			.update(schema.domain)
			.set({ status: "failed" })
			.where(eq(schema.domain.id, domainId));
		return;
	}

	// Conditionally verify MX (Enable Receiving)
	const isReceivingEnabled = domainWithRecords.isReceivingEmailEnabled;
	const mxRecord = isReceivingEnabled
		? records.find((r) => r.recordType === "MX")
		: undefined;

	if (isReceivingEnabled && !mxRecord) {
		log.warn({
			message: "Missing MX record when receiving is enabled",
			domainId,
		});
		await db
			.update(schema.domain)
			.set({ status: "failed" })
			.where(eq(schema.domain.id, domainId));
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
		await db
			.update(schema.domain)
			.set({ status: "failed" })
			.where(eq(schema.domain.id, domainId));
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

	if (isReceivingEnabled && mxRecord) {
		activeResults.push({
			record: mxRecord,
			verifyFn: () =>
				verifyMxRecord(mxRecord.fqdn, mxRecord.value, mxRecord.priority ?? 10),
		});
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
	const mxOk = mxRecord
		? (results.find((r) => r.record.id === mxRecord.id)?.ok ?? false)
		: true;
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

	// Update individual record statuses
	await Promise.all(
		results.map(({ record, ok }) => {
			if (!ok && !isLastAttempt) return Promise.resolve();

			return db
				.update(schema.domainDnsRecord)
				.set({ status: ok ? "active" : "failed" })
				.where(eq(schema.domainDnsRecord.id, record.id));
		}),
	);

	const allPassed = dkimOk && spfOk && dmarcOk && mxOk && cnameOk;

	if (allPassed || isLastAttempt) {
		const newDomainStatus = allPassed ? "active" : "failed";

		await db
			.update(schema.domain)
			.set({ status: newDomainStatus })
			.where(eq(schema.domain.id, domainId));
	}

	if (allPassed) {
		log.info({ message: "Domain verified successfully", domainId, domainName });
	} else {
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
			`Verification failed for ${domainName}: DKIM=${dkimOk} SPF=${spfOk} DMARC=${dmarcOk} MX=${mxOk} CNAME=${cnameOk}`,
		);
	}
}
