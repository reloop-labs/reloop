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
		const { domain, organizationId } = event.data;

		if (!domain || !organizationId) {
			logger.error(
				{ domain, organizationId },
				"Missing required fields: domain or organizationId",
			);
			throw new Error("Missing required fields: domain or organizationId");
		}

		const result = await step.run("verify-dns-records", async () => {
			logger.info({ domain, organizationId }, "Starting DNS verification");

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

		return {
			success: true,
			domain: result.domain,
			status: result.status,
			verifiedRecords: result.dnsRecords.filter((r) => r.isVerified).length,
			totalRecords: result.dnsRecords.length,
		};
	},
);
