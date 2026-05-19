import {
	ContactErrors,
	PropertyErrors,
} from "@be/contacts/error/contacts.error-response";
import type { PropertyTypes } from "@be/contacts/types/property.type";
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
		const existingProperties = await db
			.select()
			.from(schema.contactProperty)
			.where(
				and(
					eq(schema.contactProperty.propertyName, name),
					eq(schema.contactProperty.organizationId, organizationId),
				),
			)
			.limit(1);

		const existingProperty = existingProperties[0] || null;

		if (existingProperty) {
			if (existingProperty.deletedAt === null) {
				log.warn("Property already exists in this organization", {
					name: name,
				});
				throw PropertyErrors.alreadyExists(name);
			}

			// Soft-deleted property exists, restore/undelete it!
			log.info("Soft-deleted property found, restoring it", { name });
			const [restoredProperty] = await db
				.update(schema.contactProperty)
				.set({
					deletedAt: null,
					propertyType: type,
					defaultValue: fallbackValue || null,
					updatedAt: new Date(),
				})
				.where(eq(schema.contactProperty.id, existingProperty.id))
				.returning();

			if (!restoredProperty) {
				log.error("Failed to restore property - no data returned", {
					name: name,
				});
				throw ContactErrors.createFailed("Failed to restore property");
			}

			log.info("Property restored successfully", {
				name: name,
				id: restoredProperty.id,
			});

			const result = {
				...restoredProperty,
				object: "contact_property" as const,
				event: PROPERTY_CREATE_WEBHOOK_EVENT.id,
			};

			return result;
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
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
