import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
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
	const log = useLogger();
	try {
		log.info("Updating domain");

		const existingDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});

		if (!existingDomain) {
			log.warn("Domain not found");
			throw DomainErrors.domainNotFound(domainId);
		}

		const updateData: Partial<typeof schema.domain.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (body.sending_email !== undefined) {
			updateData.sendingEmail = body.sending_email;
		}

		if (body.receiving_email !== undefined) {
			updateData.receivingEmail = body.receiving_email;
		}

		if (body.click_tracking !== undefined) {
			updateData.clickTracking = body.click_tracking;
		}

		if (body.open_tracking !== undefined) {
			updateData.openTracking = body.open_tracking;
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

		await bus.publish(BusEvent.DOMAIN_UPDATED, {
			domainId,
			domain: updatedDomain.domain,
			organizationId,
		});

		return finalDomain;
	} catch (error) {
		log.error("Error updating domain settings");
		throw error;
	}
}
