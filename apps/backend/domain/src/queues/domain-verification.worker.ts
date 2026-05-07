import { domainConfig } from "@be/domain/domain.config";

import {
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/domain/utils/verify-dns-records";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { Worker } from "bullmq";
import { and, eq, isNull } from "drizzle-orm";
import {
	DOMAIN_VERIFICATION_QUEUE,
	type DomainVerificationJobData,
} from "./domain-verification.queue";

const connection = {
	url: domainConfig.REDIS_URL,
};

async function processDomainVerification(
	domainId: string,
	organizationId: string,
	isLastAttempt: boolean,
): Promise<void> {
	logger.info({ domainId }, "Processing domain verification job");

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
		throw new Error(`Domain ${domainId} not found`);
	}

	const domainName = domainWithRecords.domain;
	const records = domainWithRecords.dnsRecords;
	logger.info({ domainId, records }, "Fetched DNS records from database");

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
		logger.warn(
			{ domainId },
			"Missing one or more DNS records for verification",
		);
		await db
			.update(schema.domain)
			.set({ status: "failed" })
			.where(eq(schema.domain.id, domainId));
		return;
	}

	// Run all verifications in parallel using FQDNs from database
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

	logger.info(
		{ domainId, domainName, mxOk, spfOk, dkimOk, dmarcOk },
		"DNS verification results",
	);

	// Update individual record statuses
	await Promise.all(
		results.map(({ record, ok }) => {
			// Only update to failed if it's the last attempt
			if (!ok && !isLastAttempt) return Promise.resolve();

			return db
				.update(schema.domainDnsRecord)
				.set({ status: ok ? "active" : "failed" })
				.where(eq(schema.domainDnsRecord.id, record.id));
		}),
	);

	const allPassed = mxOk && spfOk && dkimOk && dmarcOk;

	// Only update domain status to failed if it's the last attempt
	if (allPassed || isLastAttempt) {
		const newDomainStatus = allPassed ? "active" : "failed";

		await db
			.update(schema.domain)
			.set({ status: newDomainStatus })
			.where(eq(schema.domain.id, domainId));
	}

	if (allPassed) {
		logger.info({ domainId, domainName }, "Domain verified successfully");
	} else {
		logger.warn(
			{ domainId, domainName, mxOk, spfOk, dkimOk, dmarcOk },
			"Domain verification failed — one or more DNS records did not match",
		);
		// Throw so BullMQ retries on failure
		throw new Error(
			`Domain ${domainName} verification failed: MX=${mxOk} SPF=${spfOk} DKIM=${dkimOk} DMARC=${dmarcOk}`,
		);
	}
}

export function startDomainVerificationWorker(): Worker {
	const worker = new Worker<DomainVerificationJobData>(
		DOMAIN_VERIFICATION_QUEUE,
		async (job) => {
			const { domainId, organizationId } = job.data;
			const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
			await processDomainVerification(domainId, organizationId, isLastAttempt);
		},
		{
			connection,
			concurrency: 5,
		},
	);

	worker.on("completed", (job) => {
		logger.info(
			{ jobId: job.id, domainId: job.data.domainId },
			"Domain verification job completed",
		);
	});

	worker.on("failed", (job, err) => {
		logger.error(
			{ jobId: job?.id, domainId: job?.data.domainId, error: err.message },
			"Domain verification job failed",
		);
	});

	worker.on("error", (err) => {
		logger.error({ error: err.message }, "Domain verification worker error");
	});

	logger.info("Domain verification worker started");
	return worker;
}
