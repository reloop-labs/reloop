import { log } from "evlog";
import type { PropertyTypes } from "@be/contacts/types/property.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { PROPERTY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export const createPropertyController = async ({
	activeOrganizationId,
	userId,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	userId: string;
	body: PropertyTypes.CreatePropertyRequest;
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
	log.info({ ...({ name: body.name, type: body.type }), message: "Creating property" });

	try {
		const existingProperty = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.propertyName, body.name),
					eq(schema.contactProperty.organizationId, activeOrganizationId),
				),
			)
			.limit(1);

		if (existingProperty.length > 0) {
			log.warn({ ...({ name: body.name }), message: "Property already exists in this organization" });
			throw status(409, { message: "Property already exists" });
		}

		const [newProperty] = await db
			.insert(schema.contactProperty)
			.values({
				propertyName: body.name,
				propertyType: body.type,
				defaultValue: body.fallbackValue || null,
				organizationId: activeOrganizationId,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newProperty) {
			log.error({ ...({ name: body.name }), message: "Failed to create property - no data returned" });
			throw status(500, { message: "Failed to create property" });
		}

		log.info({ ...({ name: body.name, id: newProperty.id }), message: "Property created successfully" });

		const result = {
			...newProperty,
			object: "contact_property" as const,
			event: PROPERTY_CREATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: PROPERTY_CREATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 201 },
		});

		return result;
	} catch (error) {
		log.error({ ...({ name: body.name, error }), message: "Debug creating property" });
		throw error;
	}
};
