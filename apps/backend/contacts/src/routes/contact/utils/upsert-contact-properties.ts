import {
	ContactErrors,
	PropertyErrors,
} from "@be/contacts/error/contacts.error-response";
import { type DatabaseInstance, db as defaultDb } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

function sanitizeText(val: string): string {
	return val
		.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
		.replace(/<\/?[^>]+(>|$)/g, "");
}

export async function upsertContactProperties({
	contactId,
	organizationId,
	userId,
	properties,
	db = defaultDb,
}: {
	contactId: string;
	organizationId: string;
	userId: string;
	properties: Record<string, string | number>;
	db?: DatabaseInstance;
}): Promise<void> {
	const log = useLogger();
	const propertyNames = Object.keys(properties);

	// Validate property names
	const propertyNameRegex = /^[a-z0-9_]+$/;
	for (const name of propertyNames) {
		if (!propertyNameRegex.test(name)) {
			log.warn("Invalid property name", { name });
			throw PropertyErrors.invalidName(
				name,
				`Invalid property name: '${name}'. Property names must be lowercase and contain only alphanumeric characters and underscores.`,
			);
		}
	}

	log.info("Upserting properties for contact (replacement mode)", {
		contactId,
		organizationId,
		propertyCount: propertyNames.length,
	});

	try {
		// 1. Fetch all existing active property values for this contact
		const currentValues = await db
			.select({
				id: schema.contactPropertyValue.id,
				propertyName: schema.contactProperty.propertyName,
			})
			.from(schema.contactPropertyValue)
			.innerJoin(
				schema.contactProperty,
				eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
			)
			.where(
				and(
					eq(schema.contactPropertyValue.contactId, contactId),
					eq(schema.contactPropertyValue.organizationId, organizationId),
					isNull(schema.contactPropertyValue.deletedAt),
				),
			);

		// 2. Identify properties to delete (in DB but NOT in request)
		const propertiesToDelete = currentValues.filter(
			(cv) => !propertyNames.includes(cv.propertyName),
		);

		if (propertiesToDelete.length > 0) {
			log.info("Soft-deleting properties not in request", {
				count: propertiesToDelete.length,
			});
			await db
				.update(schema.contactPropertyValue)
				.set({ deletedAt: new Date(), updatedAt: new Date() })
				.where(
					inArray(
						schema.contactPropertyValue.id,
						propertiesToDelete.map((p) => p.id),
					),
				);
		}

		if (propertyNames.length === 0) return;

		// 3. Process incoming properties (update or insert)
		const existingProperties = await db
			.select({
				id: schema.contactProperty.id,
				propertyName: schema.contactProperty.propertyName,
				propertyType: schema.contactProperty.propertyType,
			})
			.from(schema.contactProperty)
			.where(
				and(
					inArray(schema.contactProperty.propertyName, propertyNames),
					eq(schema.contactProperty.organizationId, organizationId),
					isNull(schema.contactProperty.deletedAt),
				),
			);

		const propertyInfo = new Map<
			string,
			{ id: string; type: "string" | "number" }
		>(
			existingProperties.map((p) => [
				p.propertyName,
				{ id: p.id, type: p.propertyType as "string" | "number" },
			]),
		);

		for (const [name, value] of Object.entries(properties)) {
			let info = propertyInfo.get(name);
			const incomingType = typeof value === "number" ? "number" : "string";

			if (!info) {
				log.info("Creating new property definition", {
					name,
					incomingType,
				});
				const [newProp] = await db
					.insert(schema.contactProperty)
					.values({
						propertyName: name,
						propertyType: incomingType,
						organizationId,
						userId,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
					.returning();

				if (newProp) {
					info = {
						id: newProp.id,
						type: newProp.propertyType as "string" | "number",
					};
					propertyInfo.set(name, info);
				}
			}

			if (info) {
				// Validate type compatibility
				if (incomingType !== info.type) {
					log.warn("Property type mismatch", {
						name,
						expected: info.type,
						received: incomingType,
					});
					throw PropertyErrors.typeMismatch(name, info.type, incomingType);
				}

				const pid = info.id;
				let stringValue = String(value);

				if (info.type === "number") {
					const numVal = Number(value);
					if (Number.isNaN(numVal) || !Number.isFinite(numVal)) {
						log.warn("Invalid numeric value", { name, value });
						throw PropertyErrors.typeMismatch(name, "number", typeof value);
					}
					stringValue = String(numVal);
				} else {
					// Sanitize string type to prevent stored XSS
					stringValue = sanitizeText(stringValue);
				}

				// Find existing value record (even if soft-deleted) to update/restore it
				const existingValue = await db.query.contactPropertyValue.findFirst({
					where: and(
						eq(schema.contactPropertyValue.contactId, contactId),
						eq(schema.contactPropertyValue.propertyId, pid),
						eq(schema.contactPropertyValue.organizationId, organizationId),
					),
				});

				if (existingValue) {
					log.info("Updating existing property value", { name, id: pid });
					await db
						.update(schema.contactPropertyValue)
						.set({
							value: stringValue,
							updatedAt: new Date(),
							deletedAt: null, // Restore if it was soft-deleted
						})
						.where(eq(schema.contactPropertyValue.id, existingValue.id));
				} else {
					log.info("Inserting new property value", { name, id: pid });
					await db.insert(schema.contactPropertyValue).values({
						contactId,
						propertyId: pid,
						value: stringValue,
						organizationId,
						userId,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				}
			}
		}
	} catch (error) {
		log.error("Error upserting contact properties", {
			contactId,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
