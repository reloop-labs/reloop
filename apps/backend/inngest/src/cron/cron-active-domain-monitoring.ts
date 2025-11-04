import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";

const EMAIL_CRITICAL_RECORD_TYPES = ["SPF", "DKIM", "DMARC", "TXT"] as const;

export const cronActiveDomainMonitoring = inngest.createFunction(
	{
		id: "cron-active-domain-monitoring",
		name: "Continuous Active Domain DNS Monitoring",
	},
	{
		cron: "*/30 * * * *", // Every 30 minutes
	},
	async ({ step }: { step: any }) => {
		const BATCH_SIZE = Number.parseInt(
			process.env.DNS_MONITORING_BATCH_SIZE || "200",
			10,
		);
		const CHECK_INTERVAL_HOURS = 6; // Re-check domains after 6 hours

		// Find active domains that need DNS monitoring
		const domains = await step.run(
			"find-active-domains-to-monitor",
			async () => {
				const cutoffTime = new Date();
				cutoffTime.setHours(cutoffTime.getHours() - CHECK_INTERVAL_HOURS);

				const domainsToMonitor = await db
					.select({
						id: schema.domain.id,
						domain: schema.domain.domain,
						organizationId: schema.domain.organizationId,
						lastVerifiedAt: schema.domain.lastVerifiedAt,
					})
					.from(schema.domain)
					.where(
						and(
							eq(schema.domain.status, "active"),
							isNull(schema.domain.deletedAt),
							// Prioritize domains that haven't been checked in CHECK_INTERVAL_HOURS or never checked
							or(
								isNull(schema.domain.lastVerifiedAt),
								lt(schema.domain.lastVerifiedAt, cutoffTime),
							),
						),
					)
					.orderBy(sql`${schema.domain.lastVerifiedAt} ASC NULLS FIRST`)
					.limit(BATCH_SIZE);

				logger.info(
					{
						count: domainsToMonitor.length,
						batchSize: BATCH_SIZE,
						cutoffTime: cutoffTime.toISOString(),
					},
					"Found active domains to monitor",
				);

				return domainsToMonitor;
			},
		);

		// Trigger DNS verification for each domain's DNS records
		await step.run("trigger-dns-monitoring", async () => {
			// Process domains in sub-batches to limit concurrent DNS queries
			const SUB_BATCH_SIZE = 20;
			const results = [];

			for (let i = 0; i < domains.length; i += SUB_BATCH_SIZE) {
				const subBatch = domains.slice(i, i + SUB_BATCH_SIZE);

				// For each domain, fetch its DNS records and trigger verification
				const batchPromises = subBatch.map(
					async (domain: {
						id: string;
						domain: string;
						organizationId: string;
					}) => {
						// Get DNS records for this domain
						const dnsRecords = await db
							.select({
								id: schema.domainDnsRecord.id,
								recordType: schema.domainDnsRecord.recordType,
								name: schema.domainDnsRecord.name,
								value: schema.domainDnsRecord.value,
							})
							.from(schema.domainDnsRecord)
							.where(
								and(
									eq(schema.domainDnsRecord.domainId, domain.id),
									isNull(schema.domainDnsRecord.deletedAt),
									// Only check email-critical records: SPF, DKIM, DMARC
									inArray(
										schema.domainDnsRecord.recordType,
										EMAIL_CRITICAL_RECORD_TYPES,
									),
								),
							)
							.limit(10); // Limit to 10 records per domain

						// Trigger verification for each DNS record
						const recordPromises = dnsRecords.map((record) =>
							inngest.send({
								name: "verify/dns-record",
								data: {
									dnsRecordId: record.id,
									domainId: domain.id,
									recordType: record.recordType,
									name: record.name,
									value: record.value,
									organizationId: domain.organizationId,
								},
							}),
						);

						await Promise.allSettled(recordPromises);

						return { domainId: domain.id, recordCount: dnsRecords.length };
					},
				);

				const batchResults = await Promise.allSettled(batchPromises);
				results.push(...batchResults);

				// Small delay between sub-batches to avoid overwhelming DNS servers
				if (i + SUB_BATCH_SIZE < domains.length) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}

			const successful = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;

			logger.info(
				{
					totalDomains: domains.length,
					successful,
					failed,
				},
				"Triggered DNS monitoring for active domains",
			);
		});

		// Update lastVerifiedAt timestamp for all monitored domains
		await step.run("update-monitoring-timestamps", async () => {
			const domainIds = domains.map((d: { id: string }) => d.id);

			if (domainIds.length > 0) {
				// Update each domain using IN clause
				await db
					.update(schema.domain)
					.set({
						lastVerifiedAt: new Date(),
						updatedAt: new Date(),
					})
					.where(inArray(schema.domain.id, domainIds));

				logger.info(
					{ count: domainIds.length },
					"Updated monitoring timestamps for domains",
				);
			}
		});

		return {
			domainsMonitored: domains.length,
			batchSize: BATCH_SIZE,
		};
	},
);
