import { getDomainHost } from "@be/domain/utils/domain-formatter";
import {
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/domain/utils/verify-dns-records";
import { inngest } from "@be/workflow/inngest";
import { workflowConfig } from "@be/workflow/utils/workflow.config";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export const verifyDomainFunction = inngest.createFunction(
	{ id: "domain-verification", name: "Domain Verification" },
	{ event: "domain.verification" },
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
			throw new Error("Missing required fields: domain or organizationId");
		}

		const result = await step.run("verify-dns-records", async () => {
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

			// Calculate counts and statuses
			const verifiedCount = verificationResults.filter(
				(r) => r.isVerified,
			).length;
			const totalCount = verificationResults.length;
			const unverifiedCount = totalCount - verifiedCount;
			const isAllVerified = verifiedCount === totalCount && totalCount > 0;

			// Separate records into active and non-active
			const activeRecords = verificationResults.filter((r) => r.isVerified);
			const nonActiveRecords = verificationResults.filter((r) => !r.isVerified);

			// Update DNS records: mark active ones as "active", others as "verifying"
			await db.transaction(async (tx) => {
				// Update active records to "active"
				if (activeRecords.length > 0) {
					await Promise.all(
						activeRecords.map((result) =>
							tx
								.update(schema.domainDnsRecord)
								.set({
									status: "active",
									updatedAt: new Date(),
								})
								.where(eq(schema.domainDnsRecord.id, result.id)),
						),
					);
				}

				// Update non-active records to "verifying" (will be checked again after 1 hour)
				if (nonActiveRecords.length > 0) {
					await Promise.all(
						nonActiveRecords.map((result) =>
							tx
								.update(schema.domainDnsRecord)
								.set({
									status: "verifying",
									updatedAt: new Date(),
								})
								.where(eq(schema.domainDnsRecord.id, result.id)),
						),
					);
				}

				// Update domain status: "active" if all verified, otherwise "verifying"
				const domainStatus = isAllVerified ? "active" : "verifying";
				await tx
					.update(schema.domain)
					.set({
						status: domainStatus,
						lastVerifiedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(schema.domain.id, domainWithRecords.id));
			});

			return {
				...domainWithRecords,
				dnsRecords: verificationResults,
				verifiedCount,
				totalCount,
				unverifiedCount,
				isAllVerified,
				hasUnverifiedRecords: unverifiedCount > 0,
			};
		});

		// If there are unverified records and we have retries left, schedule next attempt after 1 hour
		if (result.hasUnverifiedRecords && attempt < maxAttempts - 1) {
			const retryHours = 1;
			const retryMs = retryHours * 60 * 60 * 1000; // 1 hour in milliseconds

			// Schedule next retry using step.sleep
			await step.sleep(`retry-in-${retryHours}-hour`, retryMs);

			// Send event for next attempt
			await step.sendEvent("schedule-next-retry", {
				name: "domain.verification",
				data: {
					domain,
					organizationId,
					attempt: attempt + 1,
				},
			});

			return {
				success: result.isAllVerified,
				domain: result.domain,
				status: result.status,
				verifiedRecords: result.verifiedCount,
				totalRecords: result.totalCount,
				unverifiedRecords: result.unverifiedCount,
				attempt: attempt + 1,
				maxAttempts,
				message: `${result.verifiedCount}/${result.totalCount} records verified. Next check in ${retryHours} hour for remaining records.`,
				nextAttemptIn: `${retryHours} hour`,
			};
		}

		// Final result (either all verified or max attempts reached)
		if (result.hasUnverifiedRecords) {
			// Max attempts reached - mark unverified records as "failed"
			const unverifiedRecords = result.dnsRecords.filter((r) => !r.isVerified);
			await db.transaction(async (tx) => {
				// Update unverified records to "failed"
				await Promise.all(
					unverifiedRecords.map((record) =>
						tx
							.update(schema.domainDnsRecord)
							.set({
								status: "failed",
								updatedAt: new Date(),
							})
							.where(eq(schema.domainDnsRecord.id, record.id)),
					),
				);

				// Update domain status to "failed" if no records are active
				const finalDomainStatus =
					result.verifiedCount > 0 ? "active" : "failed";
				await tx
					.update(schema.domain)
					.set({
						status: finalDomainStatus,
						updatedAt: new Date(),
					})
					.where(eq(schema.domain.id, result.id));
			});
		} else {
			return {
				success: result.isAllVerified,
				domain: result.domain,
				status: result.status,
				verifiedRecords: result.verifiedCount,
				totalRecords: result.totalCount,
				unverifiedRecords: result.unverifiedCount,
				attempt: attempt + 1,
				maxAttempts,
				message: result.isAllVerified
					? "Domain verification successful! All records are active."
					: `Verification incomplete after ${maxAttempts} attempts. ${result.verifiedCount}/${result.totalCount} records verified.`,
			};
		}
	},
);
