import { log } from "evlog";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { PROPERTY_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const updatePropertyController = async ({
	activeOrganizationId,
	property_id,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	property_id: string;
	body: { fallbackValue: string | null };
	logger?: any;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<PropertyTypes.PropertyResponse> => {
	log.info({ ...({ property_id, fallbackValue: body.fallbackValue }), message: "Updating property" });

	try {
		const existingProperty = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.id, property_id),
					eq(schema.contactProperty.organizationId, activeOrganizationId),
					isNull(schema.contactProperty.deletedAt),
				),
			)
			.limit(1);

		if (existingProperty.length === 0) {
			log.warn({ ...({ property_id }), message: "Property not found" });
			throw status(404, { message: "Property not found" });
		}

		const [updatedProperty] = await db
			.update(schema.contactProperty)
			.set({ defaultValue: body.fallbackValue, updatedAt: new Date() })
			.where(eq(schema.contactProperty.id, property_id))
			.returning();

		if (!updatedProperty) {
			log.error({ ...({ property_id }), message: "Failed to update property - no data returned" });
			throw status(500, { message: "Failed to update property" });
		}

		log.info({ ...({ property_id }), message: "Property updated successfully" });

		const result = {
			...updatedProperty,
			object: "contact_property" as const,
			event: PROPERTY_UPDATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: PROPERTY_UPDATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		log.error({ ...({ property_id, error }), message: "Debug updating property" });
		throw error;
	}
};
