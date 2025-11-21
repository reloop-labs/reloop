import { getDomainHost } from "@be/domain/utils/domain-formatter";
import {
	verifyDkimRecord,
	verifyDmarcRecord,
	verifyMxRecord,
	verifySpfRecord,
} from "@be/domain/utils/verify-dns-records";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { Inngest } from "inngest";

export const inngest = new Inngest({
	id: "workflow",
	name: "Reloop Workflows",
});

export const helloWorldFunction = inngest.createFunction(
	{ id: "hello-world", name: "Hello World" },
	{ event: "test/hello-world" },
	async ({ event, step }) => {
		await step.run("hello-world", async () => {
			logger.info("Hello, world!");
		});
	},
);

export const verifyDomainFunction = inngest.createFunction(
	{ id: "verify-domain", name: "Verify Domain" },
	{ event: "verify/domain" },
	async ({ event, step }) => {
		const {
			domain,
			organizationId,
			attempt = 0,
			startedAt,
		} = event.data as {
			domain: string;
			organizationId: string;
			attempt?: number;
			startedAt?: string; // ISO timestamp string
		};

		if (!domain || !organizationId) {
			logger.error(
				{ domain, organizationId },
				"Missing required fields: domain or organizationId",
			);
			throw new Error("Missing required fields: domain or organizationId");
		}

		// Set startedAt to now if this is the first attempt
		const verificationStartedAt = startedAt ? new Date(startedAt) : new Date();

		// Calculate elapsed time since verification started
		const elapsedMs = Date.now() - verificationStartedAt.getTime();
		const elapsedHours = elapsedMs / (1000 * 60 * 60);
		const maxHours = 24;
		const timeRemaining = maxHours - elapsedHours;

		logger.info(
			{
				domain,
				organizationId,
				attempt: attempt + 1,
				elapsedHours: elapsedHours.toFixed(2),
				timeRemaining: timeRemaining.toFixed(2),
			},
			`Starting DNS verification (attempt ${attempt + 1}, ${timeRemaining.toFixed(2)}h remaining)`,
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
				const verifiedCount = verificationResults.filter(
					(r) => r.isVerified,
				).length;

				const domainStatus =
					verifiedCount === verificationResults.length &&
					verificationResults.length > 0
						? "active"
						: "failed";
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

		// Check if 24 hours have passed
		const hasTimeRemaining = elapsedHours < maxHours;

		// If verification failed and we still have time (less than 24 hours), schedule next attempt
		if (!isVerified && hasTimeRemaining) {
			// Exponential backoff: 2min, 4min, 8min, 16min, 32min, 64min, 128min...
			// But cap at 2 hours (120 minutes) to avoid too long waits
			const backoffMinutes = Math.min(2 ** (attempt + 1), 120); // Max 2 hours
			const backoffMs = backoffMinutes * 60 * 1000;

			// Check if next retry would exceed 24 hours
			const nextRetryTime = elapsedMs + backoffMs;
			const nextRetryHours = nextRetryTime / (1000 * 60 * 60);

			if (nextRetryHours >= maxHours) {
				// If next retry would exceed 24 hours, stop now
				logger.warn(
					{
						domain,
						organizationId,
						attempt: attempt + 1,
						elapsedHours: elapsedHours.toFixed(2),
					},
					"Verification failed. 24-hour limit reached. Stopping retries.",
				);

				return {
					success: false,
					domain: result.domain,
					status: result.status,
					verifiedRecords: verifiedCount,
					totalRecords: totalCount,
					attempt: attempt + 1,
					elapsedHours: elapsedHours.toFixed(2),
					message: `Verification failed after 24 hours (${attempt + 1} attempts)`,
				};
			}

			logger.info(
				{
					domain,
					organizationId,
					attempt: attempt + 1,
					nextAttempt: attempt + 2,
					backoffMinutes,
					verifiedCount,
					totalCount,
					elapsedHours: elapsedHours.toFixed(2),
					timeRemaining: (maxHours - nextRetryHours).toFixed(2),
				},
				`Verification failed. Scheduling retry in ${backoffMinutes} minutes`,
			);

			// Schedule next retry using step.sleep
			await step.sleep(`retry-in-${backoffMinutes}-minutes`, backoffMs);

			// Send event for next attempt
			await step.sendEvent("schedule-next-retry", {
				name: "verify/domain",
				data: {
					domain,
					organizationId,
					attempt: attempt + 1,
					startedAt: verificationStartedAt.toISOString(), // Pass the original start time
				},
			});

			return {
				success: false,
				domain: result.domain,
				status: result.status,
				verifiedRecords: verifiedCount,
				totalRecords: totalCount,
				attempt: attempt + 1,
				elapsedHours: elapsedHours.toFixed(2),
				timeRemaining: (maxHours - nextRetryHours).toFixed(2),
				message: `Verification failed. Next retry scheduled in ${backoffMinutes} minutes (attempt ${attempt + 2}, ${(maxHours - nextRetryHours).toFixed(2)}h remaining)`,
				nextAttemptIn: `${backoffMinutes} minutes`,
			};
		}

		// Final result (either success or 24-hour limit reached)
		if (!isVerified) {
			logger.warn(
				{
					domain,
					organizationId,
					attempt: attempt + 1,
					verifiedCount,
					totalCount,
					elapsedHours: elapsedHours.toFixed(2),
				},
				`Verification failed after 24 hours (${attempt + 1} attempts). Stopping retries.`,
			);
		} else {
			logger.info(
				{
					domain,
					organizationId,
					attempt: attempt + 1,
					verifiedCount,
					totalCount,
					elapsedHours: elapsedHours.toFixed(2),
				},
				"Domain verification successful!",
			);
		}

		return {
			success: isVerified,
			domain: result.domain,
			status: result.status,
			verifiedRecords: verifiedCount,
			totalRecords: totalCount,
			attempt: attempt + 1,
			elapsedHours: elapsedHours.toFixed(2),
			message: isVerified
				? "Domain verification successful!"
				: `Verification failed after 24 hours (${attempt + 1} attempts)`,
		};
	},
);
