import { getDomainHost } from "@be/domain/utils/domain-formatter";
import {
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/domain/utils/verify-dns-records";
import { workflowConfig } from "@be/workflow/utils/workflow.config";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { Inngest } from "inngest";

export const inngest = new Inngest({
	id: "workflow",
	name: "Reloop Workflows",
});

export const verifyDomainFunction = inngest.createFunction(
	{ id: "verify-domain", name: "Verify Domain" },
	{ event: "verify/domain" },
	async ({ event, step }) => {
		const {
			domain,
			organizationId,
			attempt = 0,
		} = event.data as {
			domain: string;
			organizationId: string;
			attempt?: number;
		};

		const maxAttempts = workflowConfig.domainVerification.maxAttempts;

		if (!domain || !organizationId) {
			logger.error(
				{ domain, organizationId },
				"Missing required fields: domain or organizationId",
			);
			throw new Error("Missing required fields: domain or organizationId");
		}

		logger.info(
			{
				domain,
				organizationId,
				attempt: attempt + 1,
				maxAttempts,
			},
			`Starting DNS verification (attempt ${attempt + 1}/${maxAttempts})`,
		);

		const result = await step.run("verify-dns-records", async () => {
			// Fetch domain with DNS records
			const domainWithRecords = await db.query.domain.findFirst({
				where: and(
					eq(schema.domain.domain, domain),
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
				logger.warn({ domain }, "Domain not found");
				throw new Error("Domain not found");
			}

			// Set status to verifying
			await db
				.update(schema.domain)
				.set({ status: "verifying" })
				.where(eq(schema.domain.id, domainWithRecords.id));
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "verifying" })
				.where(eq(schema.domainDnsRecord.domainId, domainWithRecords.id));

			// Verify all DNS records
			const verificationResults = await Promise.all(
				domainWithRecords.dnsRecords.map(async (record) => {
					let isVerified = false;
					const recordType = record.recordTypeName.toUpperCase();
					const domainNameVerify = `${record.name}.${getDomainHost(domainWithRecords.domain)}`;
					const domainValue = record.value;
					try {
						switch (recordType) {
							case "MX":
								if (record.priority !== null && record.priority !== undefined) {
									isVerified = await verifyMxRecord(
										domainNameVerify,
										domainValue,
										record.priority,
									);
								} else {
									isVerified = false;
								}
								break;
							case "SPF":
								isVerified = await verifySpfRecord(
									domainNameVerify,
									domainValue,
								);
								break;
							case "DKIM":
								isVerified = await verifyDkimRecord(
									domainNameVerify,
									domainValue,
								);
								break;
							case "DMARC":
								isVerified = await verifyDmarcRecord(
									domainNameVerify,
									domainValue,
								);
								break;

							default:
								isVerified = false;
								logger.info({ isVerified }, "Record type not supported");
								break;
						}
					} catch (error) {
						logger.error(
							{
								domain,
								recordType,
								name: record.name,
								error: error instanceof Error ? error.message : String(error),
							},
							`Error verifying ${recordType} record`,
						);
						isVerified = false;
					}
					return {
						...record,
						isVerified,
					};
				}),
			);

			// Check if verification will succeed before updating status
			const verifiedCount = verificationResults.filter(
				(r) => r.isVerified,
			).length;
			const isAllVerified =
				verifiedCount === verificationResults.length &&
				verificationResults.length > 0;

			// Update all DNS records and domain status in one transaction
			await db.transaction(async (tx) => {
				await Promise.all(
					verificationResults.map((result) =>
						tx
							.update(schema.domainDnsRecord)
							.set({
								status: result.isVerified ? "active" : "failed",
								updatedAt: new Date(),
							})
							.where(eq(schema.domainDnsRecord.id, result.id)),
					),
				);

				const domainStatus = isAllVerified ? "active" : "failed";
				await tx
					.update(schema.domain)
					.set({
						status: domainStatus,
						lastVerifiedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(schema.domain.id, domainWithRecords.id));
			});

			const verificationResult = {
				...domainWithRecords,
				dnsRecords: verificationResults,
			};

			logger.info(
				{
					domain,
					status: verificationResult.status,
					verifiedCount: verificationResults.filter((r) => r.isVerified).length,
					totalCount: verificationResults.length,
				},
				"DNS verification completed",
			);

			return verificationResult;
		});

		const isVerified = result.status === "active";
		const verifiedCount = result.dnsRecords.filter((r) => r.isVerified).length;
		const totalCount = result.dnsRecords.length;

		// If verification failed and we have retries left, schedule next attempt
		if (!isVerified && attempt < maxAttempts - 1) {
			// Set status back to "verifying" since we're going to retry
			await db
				.update(schema.domain)
				.set({ status: "verifying" })
				.where(eq(schema.domain.id, result.id));
			await db
				.update(schema.domainDnsRecord)
				.set({ status: "verifying" })
				.where(eq(schema.domainDnsRecord.domainId, result.id));

			// Get retry interval from config
			const backoffHours = workflowConfig.domainVerification.retryIntervalHours;
			const backoffMs = backoffHours * 60 * 60 * 1000; // Convert hours to milliseconds

			logger.info(
				{
					domain,
					organizationId,
					attempt: attempt + 1,
					nextAttempt: attempt + 2,
					maxAttempts,
					verifiedCount,
					totalCount,
				},
				`Verification failed. Scheduling retry in ${backoffHours} hour (attempt ${attempt + 2}/${maxAttempts})`,
			);

			// Schedule next retry using step.sleep
			await step.sleep(`retry-in-${backoffHours}-hour`, backoffMs);

			// Send event for next attempt
			await step.sendEvent("schedule-next-retry", {
				name: "verify/domain",
				data: {
					domain,
					organizationId,
					attempt: attempt + 1,
					// maxAttempts is not passed - will use default from config
				},
			});

			return {
				success: false,
				domain: result.domain,
				status: result.status,
				verifiedRecords: verifiedCount,
				totalRecords: totalCount,
				attempt: attempt + 1,
				maxAttempts,
				message: `Verification failed. Next retry scheduled in ${backoffHours} hour (attempt ${attempt + 2}/${maxAttempts})`,
				nextAttemptIn: `${backoffHours} hour`,
			};
		}

		// Final result (either success or max attempts reached)
		if (!isVerified) {
			// Update domain status to "failed" since all attempts are exhausted
			// DNS records status is already set correctly (active/failed) from the last verification
			await db
				.update(schema.domain)
				.set({ status: "failed" })
				.where(eq(schema.domain.id, result.id));

			logger.warn(
				{
					domain,
					organizationId,
					attempt: attempt + 1,
					maxAttempts,
					verifiedCount,
					totalCount,
				},
				`Verification failed after ${maxAttempts} attempts. Stopping retries.`,
			);
		} else {
			logger.info(
				{
					domain,
					organizationId,
					attempt: attempt + 1,
					maxAttempts,
					verifiedCount,
					totalCount,
				},
				"Domain verification successful!",
			);
		}

		return {
			success: isVerified,
			domain: result.domain,
			status: isVerified ? "active" : "failed",
			verifiedRecords: verifiedCount,
			totalRecords: totalCount,
			attempt: attempt + 1,
			maxAttempts,
			message: isVerified
				? "Domain verification successful!"
				: `Verification failed after ${maxAttempts} attempts`,
		};
	},
);
