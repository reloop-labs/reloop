import type { PropertyTypes } from "@be/contacts/types/property.type";
import { PropertyErrors, ContactErrors } from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { PROPERTY_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const createPropertyController = async ({
	organizationId,
	userId,
	name,
	type,
	fallbackValue,
}: {
	organizationId: string;
	userId: string;
} & PropertyTypes.CreatePropertyRequest): Promise<PropertyTypes.PropertyResponse> => {
	const log = useLogger();
	log.info("Creating property", { name: name, type: type });

	try {
		const existingProperty = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.propertyName, name),
					eq(schema.contactProperty.organizationId, organizationId),
				),
			)
			.limit(1);

		if (existingProperty.length > 0) {
			log.warn("Property already exists in this organization", {
				name: name,
			});
			throw PropertyErrors.alreadyExists(name);
		}

		const [newProperty] = await db
			.insert(schema.contactProperty)
			.values({
				propertyName: name,
				propertyType: type,
				defaultValue: fallbackValue || null,
				organizationId: organizationId,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newProperty) {
			log.error("Failed to create property - no data returned", {
				name: name,
			});
			throw ContactErrors.createFailed("Failed to create property");
		}

		log.info("Property created successfully", {
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
		log.error("Debug creating property", {
			name: name,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
