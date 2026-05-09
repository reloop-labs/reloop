import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@be/domain/lib/errors";
import { DOMAIN_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function updateDomainController({
	domainId,
	organizationId,
	body,
}: {
	domainId: string;
	organizationId: string;
	body: DomainTypes.UpdateDomainRequest;
}): Promise<DomainTypes.DomainResponse> {
	const logger = useLogger();
	try {
		logger.info("Updating domain", { domainId, body });

		const existingDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});

		if (!existingDomain) {
			logger.warn("Domain not found", { domainId });
			throw DomainErrors.domainNotFound(domainId);
		}

		const updateData: Partial<typeof schema.domain.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (body.sendingEmail !== undefined) {
			updateData.sendingEmail = body.sendingEmail;
		}

		if (body.receivingEmail !== undefined) {
			updateData.receivingEmail = body.receivingEmail;
		}

		if (body.clickTracking !== undefined) {
			updateData.clickTracking = body.clickTracking;
		}

		if (body.openTracking !== undefined) {
			updateData.openTracking = body.openTracking;
		}

		await db
			.update(schema.domain)
			.set(updateData)
			.where(
				and(
					eq(schema.domain.id, domainId),
					eq(schema.domain.organizationId, organizationId),
					isNull(schema.domain.deletedAt),
				),
			);

		const updatedDomain = await db.query.domain.findFirst({
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

		if (!updatedDomain) {
			throw DomainErrors.databaseError("Failed to update domain");
		}

		const finalDomain = {
			object: "domain" as const,
			...updatedDomain,
			event: DOMAIN_UPDATE_WEBHOOK_EVENT.id,
		};

		logger.info("Domain updated successfully", {
			domainId,
			domain: updatedDomain.domain,
			event: DOMAIN_UPDATE_WEBHOOK_EVENT.id,
		});

		return finalDomain;
	} catch (error) {
		logger.error("Error updating domain settings", { domainId, error });
		throw error;
	}
}
