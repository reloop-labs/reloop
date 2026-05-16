import {
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

	// Find each record type
	const mxRecord = records.find((r) => r.recordType === "MX");
	const spfRecord = records.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=spf1"),
	);
	const dkimRecord = records.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=DKIM1"),
	);
	const dmarcRecord = records.find(
		(r) => r.recordType === "TXT" && r.value.startsWith("v=DMARC1"),
	);

	if (!mxRecord || !spfRecord || !dkimRecord || !dmarcRecord) {
		log.warn({
			message: "Missing one or more DNS records for verification",
			domainId,
		});
		await db
			.update(schema.domain)
			.set({ status: "failed" })
			.where(eq(schema.domain.id, domainId));
		return;
	}

	// Run all verifications in parallel
	const [mxOk, spfOk, dkimOk, dmarcOk] = await Promise.all([
		verifyMxRecord(mxRecord.fqdn, mxRecord.value, mxRecord.priority ?? 10),
		verifySpfRecord(spfRecord.fqdn, spfRecord.value),
		verifyDkimRecord(dkimRecord.fqdn, dkimRecord.value),
		verifyDmarcRecord(dmarcRecord.fqdn, dmarcRecord.value),
	]);

	const results = [
		{ record: mxRecord, ok: mxOk },
		{ record: spfRecord, ok: spfOk },
		{ record: dkimRecord, ok: dkimOk },
		{ record: dmarcRecord, ok: dmarcOk },
	];

	log.info({
		message: "DNS verification results",
		domainId,
		domainName,
		mxOk,
		spfOk,
		dkimOk,
		dmarcOk,
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

	const allPassed = mxOk && spfOk && dkimOk && dmarcOk;

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
			message: "Domain verification failed — one or more DNS records did not match",
			domainId,
			domainName,
			mxOk,
			spfOk,
			dkimOk,
			dmarcOk,
		});
		
		throw new Error(
			`Verification failed for ${domainName}: MX=${mxOk} SPF=${spfOk} DKIM=${dkimOk} DMARC=${dmarcOk}`,
		);
	}
}
