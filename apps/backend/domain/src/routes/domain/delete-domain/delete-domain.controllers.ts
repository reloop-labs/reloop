import { bus, BusEvent } from "@reloop/bus";
import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@be/domain/lib/errors";
import { DOMAIN_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function deleteDomainController({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}): Promise<DomainTypes.DomainResponse> {
	const logger = useLogger();
	try {
		logger.info("Fetching domain with DNS records", { domainId });
		const domainWithDnsRecords = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				isNull(schema.domain.deletedAt),
				eq(schema.domain.organizationId, organizationId),
			),
			with: {
				dnsRecords: {
					where: isNull(schema.domainDnsRecord.deletedAt),
				},
			},
		});

		if (!domainWithDnsRecords) {
			logger.warn("Domain not found for deletion", { domainId });
			throw DomainErrors.domainNotFound(domainId);
		}

		const now = new Date();

		logger.info("Soft deleting domain", { domainId });
		const domainUpdateResult = await db
			.update(schema.domain)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(schema.domain.id, domainId))
			.returning();

		if (domainUpdateResult.length === 0) {
			logger.warn("Failed to delete domain", { domainId });
			throw DomainErrors.databaseError("Failed to delete domain");
		}

		logger.info("Soft deleting domain DNS records", { domainId });
		await db
			.update(schema.domainDnsRecord)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(schema.domainDnsRecord.domainId, domainId));

		const deletedDomain = {
			...domainWithDnsRecords,
			deletedAt: now,
			updatedAt: now,
			dnsRecords: domainWithDnsRecords.dnsRecords.map((record) => ({
				...record,
				deletedAt: now,
				updatedAt: now,
			})),
		};

		logger.info("Domain and DNS records deleted successfully", { domainId });

		const finalDomain = {
			object: "domain" as const,
			...deletedDomain,
			event: DOMAIN_DELETE_WEBHOOK_EVENT.id,
		};

		await bus.publish(BusEvent.DOMAIN_DELETED, {
			domainId,
			domain: domainWithDnsRecords.domain,
			organizationId,
		});

		return finalDomain;
	} catch (error) {
		logger.error("Error deleting domain", { domainId, error });
		throw error;
	}
}
