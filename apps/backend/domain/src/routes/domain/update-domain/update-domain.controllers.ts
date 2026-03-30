import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateDomainController({
	domainId,
	organizationId,
	body,
	logger,
}: {
	domainId: string;
	organizationId: string;
	body: DomainTypes.UpdateDomainRequest;
	logger: Logger;
}): Promise<DomainTypes.DomainResponse> {
	try {
		logger.info({ domainId, body }, "Updating domain");

		const existingDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});

		if (!existingDomain) {
			logger.warn({ domainId }, "Domain not found");
			throw status(404, { message: "Domain not found" });
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
			throw status(500, { message: "Failed to update domain" });
		}

		return updatedDomain;
	} catch (error) {
		logger.error({ domainId, error }, "Error updating domain settings");
		throw error;
	}
}
