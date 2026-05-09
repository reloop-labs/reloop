import { domainConfig } from "@be/domain/domain.config";

import { DomainErrors } from "@be/domain/lib/errors";
import {
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/domain/utils/verify-dns-records";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { Worker } from "bullmq";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
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
		throw DomainErrors.domainNotFound(domainId);
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
		log.info({ message: "Domain verified successfully", domainId, domainName });
	} else {
		log.warn({
			message:
				"Domain verification failed — one or more DNS records did not match",
			domainId,
			domainName,
			mxOk,
			spfOk,
			dkimOk,
			dmarcOk,
		});
		// Throw so BullMQ retries on failure
		throw DomainErrors.verificationFailed(
			domainName,
			`MX=${mxOk} SPF=${spfOk} DKIM=${dkimOk} DMARC=${dmarcOk}`,
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
		log.info({
			message: "Domain verification job completed",
			jobId: job.id,
			domainId: job.data.domainId,
		});
	});

	worker.on("failed", (job, err) => {
		log.error({
			message: "Domain verification job failed",
			jobId: job?.id,
			domainId: job?.data.domainId,
			error: err.message,
		});
	});

	worker.on("error", (err) => {
		log.error({
			message: "Domain verification worker error",
			error: err.message,
		});
	});

	log.info("worker", "Domain verification worker started");
	return worker;
}
