import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { PROPERTY_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const deletePropertyController = async ({
	activeOrganizationId,
	property_id,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	property_id: string;
	logger: Logger;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<{
	object: "contact_property";
	success: boolean;
	id: string;
	name: string;
	event: string;
}> => {
	logger.info({ property_id }, "Deleting property");

	try {
		const property = await db.query.contactProperty.findFirst({
			where: and(
				eq(schema.contactProperty.id, property_id),
				eq(schema.contactProperty.organizationId, activeOrganizationId),
				isNull(schema.contactProperty.deletedAt),
			),
		});

		if (!property) {
			logger.warn({ property_id }, "Property not found or already deleted");
			throw status(404, { message: "Property not found" });
		}

		await db
			.update(schema.contactProperty)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.contactProperty.id, property_id),
					eq(schema.contactProperty.organizationId, activeOrganizationId),
				),
			);

		logger.info({ property_id }, "Property deleted successfully");

		const result = {
			object: "contact_property" as const,
			success: true,
			id: property.id,
			name: property.propertyName,
			event: PROPERTY_DELETE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: PROPERTY_DELETE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		logger.error({ property_id, error }, "Debug deleting property");
		throw error;
	}
};
