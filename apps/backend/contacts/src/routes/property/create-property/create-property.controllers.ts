import type { PropertyTypes } from "@be/contacts/types/property.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";
import { useLogger } from "evlog/elysia";

export const createPropertyController = async ({
	activeOrganizationId,
	userId,
	name,
	type,
	fallbackValue,
}: {
	activeOrganizationId: string;
	userId: string;
} & PropertyTypes.CreatePropertyRequest): Promise<PropertyTypes.PropertyResponse> => {
	const logger = useLogger();
	logger?.info("Creating property", { name: name, type: type });

	try {
		const existingProperty = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.propertyName, name),
					eq(schema.contactProperty.organizationId, activeOrganizationId),
				),
			)
			.limit(1);

		if (existingProperty.length > 0) {
			logger?.warn("Property already exists in this organization", {
				name: name,
			});
			throw status(409, { message: "Property already exists" });
		}

		const [newProperty] = await db
			.insert(schema.contactProperty)
			.values({
				propertyName: name,
				propertyType: type,
				defaultValue: fallbackValue || null,
				organizationId: activeOrganizationId,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newProperty) {
			logger?.error("Failed to create property - no data returned", {
				name: name,
			});
			throw status(500, { message: "Failed to create property" });
		}

		logger?.info("Property created successfully", {
			name: name,
			id: newProperty.id,
		});

		const result = {
			...newProperty,
			object: "contact_property" as const,
			event: PROPERTY_CREATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		logger?.error("Debug creating property", {
			name: name,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
