import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { domainConfig } from "@reloop/domain/domain.config";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
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
	const log = useLogger();
	try {
		log.info("Fetching domain with DNS records");
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
			log.warn("Domain not found for deletion");
			throw DomainErrors.domainNotFound(domainId);
		}

		const platformDomain =
			domainConfig.PLATFORM_TEST_FROM_DOMAIN.toLowerCase().trim();
		if (domainWithDnsRecords.domain.toLowerCase() === platformDomain) {
			throw DomainErrors.invalidDomain(
				domainWithDnsRecords.domain,
				"The platform test domain cannot be deleted.",
			);
		}

		const now = new Date();

		log.info("Soft deleting domain");
		const domainUpdateResult = await db
			.update(schema.domain)
			.set({ deletedAt: now, updatedAt: now })
			.where(eq(schema.domain.id, domainId))
			.returning();

		if (domainUpdateResult.length === 0) {
			log.warn("Failed to delete domain");
			throw DomainErrors.databaseError("Failed to delete domain");
		}

		log.info("Soft deleting domain DNS records");
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

		log.info("Domain and DNS records deleted successfully");

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
		log.error("Error deleting domain");
		throw error;
	}
}
