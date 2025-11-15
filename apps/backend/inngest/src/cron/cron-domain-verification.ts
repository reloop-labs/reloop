import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export const cronDomainVerification = inngest.createFunction(
	{
		id: "cron-domain-verification",
		name: "Periodic Domain Verification",
	},
	{
		cron: "*/15 * * * *", // Every 15 minutes
	},
	async ({ step }: { step: any }) => {
		// Find domains that need verification
		const domains = await step.run("find-domains-to-verify", async () => {
			const domainsToVerify = await db
				.select({
					id: schema.domain.id,
					domain: schema.domain.domain,
					organizationId: schema.domain.organizationId,
				})
				.from(schema.domain)
				.where(
					and(
						eq(schema.domain.status, "start-verify"),
						isNull(schema.domain.deletedAt),
					),
				)
				.limit(50);

			logger.info({ count: domainsToVerify.length }, "Found domains to verify");

			return domainsToVerify;
		});

		// Trigger verification for each domain
		await step.run("trigger-verifications", async () => {
			await Promise.all(
				domains.map(
					(domain: { id: string; domain: string; organizationId: string }) =>
						inngest.send({
							name: "verify/domain",
							data: {
								domainId: domain.id,
								domain: domain.domain,
								organizationId: domain.organizationId,
							},
						}),
				),
			);

			logger.info({ count: domains.length }, "Triggered domain verifications");
		});

		return {
			domainsChecked: domains.length,
		};
	},
);
