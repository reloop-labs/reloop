import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteDomain(
	domainName: string,
	organizationId: string,
): Promise<void> {
	logger.info({ domain: domainName }, "Soft deleting domain");

	try {
		const domainResult = await db
			.select({ id: schema.domain.id })
			.from(schema.domain)
			.where(
				and(
					eq(schema.domain.domain, domainName),
					isNull(schema.domain.deletedAt),
					eq(schema.domain.organizationId, organizationId),
				),
			)
			.limit(1);

		const domainId = domainResult[0]?.id;
		if (!domainId) {
			logger.warn({ domain: domainName }, "Domain not found for deletion");
			throw status(404, { message: "Domain not found" });
		}
		const now = new Date();
		const domainUpdateResult = await db
			.update(schema.domain)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(schema.domain.id, domainId))
			.returning();

		if (domainUpdateResult.length === 0) {
			logger.warn({ domain: domainName }, "Failed to delete domain");
			throw status(500, { message: "Failed to delete domain" });
		}
		await db
			.update(schema.domainDnsRecord)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(schema.domainDnsRecord.domainId, domainId));

		logger.info(
			{ domain: domainName },
			"Domain and DNS records deleted successfully",
		);
	} catch (error) {
		logger.error(
			{
				domain: domainName,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting domain",
		);
		throw error;
	}
}

export async function deleteDomainHandler(
	domain: string,
	organizationId: string,
): Promise<{ message: string }> {
	logger.info({ domain, organizationId }, "Deleting domain");

	try {
		await deleteDomain(domain, organizationId);
		const response = { message: "Domain deleted successfully" };
		logger.info({ domain, organizationId }, "Domain deleted successfully");
		return response;
	} catch (error) {
		logger.error(
			{
				domain,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting domain",
		);
		throw error;
	}
}
