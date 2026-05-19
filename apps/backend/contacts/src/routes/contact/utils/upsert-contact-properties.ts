import {
	ContactErrors,
	isAppError,
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

	// Validate all property names up-front before touching the DB.
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
		// ── Step A: Load current values & property definitions in parallel ──────────
		const [currentValues, existingProperties] = await Promise.all([
			// All active property values currently stored for this contact
			db
				.select({
					id: schema.contactPropertyValue.id,
					propertyName: schema.contactProperty.propertyName,
					propertyId: schema.contactPropertyValue.propertyId,
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
				),

			// Property definitions for the names present in the request
			propertyNames.length > 0
				? db
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
						)
				: Promise.resolve(
						[] as {
							id: string;
							propertyName: string;
							propertyType: string;
						}[],
					),
		]);

		// ── Step B: Soft-delete values that are NOT in the incoming request ────────
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

		// ── Step C: Build lookup maps from the batch-loaded data ──────────────────
		const propertyInfo = new Map<
			string,
			{ id: string; type: "string" | "number" }
		>(
			existingProperties.map((p) => [
				p.propertyName,
				{ id: p.id, type: p.propertyType as "string" | "number" },
			]),
		);

		// currentValues indexed by propertyId for O(1) lookup during the upsert loop
		const existingValueByPropertyId = new Map(
			currentValues.map((cv) => [cv.propertyId, cv]),
		);

		// ── Step D: Resolve missing property definitions (auto-create) ────────────
		// Any property that doesn't exist yet must be created individually (sequential
		// is fine here — these are rare one-time registrations, not hot-path queries).
		for (const name of propertyNames) {
			if (!propertyInfo.has(name)) {
				const incomingType =
					typeof properties[name] === "number" ? "number" : "string";
				log.info("Creating new property definition", { name, incomingType });
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
					propertyInfo.set(name, {
						id: newProp.id,
						type: newProp.propertyType as "string" | "number",
					});
				}
			}
		}

		// ── Step E: Build insert / update lists and execute them in parallel ──────
		const now = new Date();
		const toInsert: (typeof schema.contactPropertyValue.$inferInsert)[] = [];
		const updateOps: Promise<unknown>[] = [];

		for (const [name, value] of Object.entries(properties)) {
			const info = propertyInfo.get(name);
			if (!info) continue; // should never happen after Step D

			const incomingType = typeof value === "number" ? "number" : "string";

			// Type-safety check
			if (incomingType !== info.type) {
				log.warn("Property type mismatch", {
					name,
					expected: info.type,
					received: incomingType,
				});
				throw PropertyErrors.typeMismatch(name, info.type, incomingType);
			}

			// Coerce & sanitize value
			let stringValue = String(value);
			if (info.type === "number") {
				const numVal = Number(value);
				if (Number.isNaN(numVal) || !Number.isFinite(numVal)) {
					log.warn("Invalid numeric value", { name, value });
					throw PropertyErrors.typeMismatch(name, "number", typeof value);
				}
				stringValue = String(numVal);
			} else {
				stringValue = sanitizeText(stringValue);
			}

			const existingValue = existingValueByPropertyId.get(info.id);

			if (existingValue) {
				// Update (and restore if soft-deleted) — fire in parallel
				updateOps.push(
					db
						.update(schema.contactPropertyValue)
						.set({ value: stringValue, updatedAt: now, deletedAt: null })
						.where(eq(schema.contactPropertyValue.id, existingValue.id)),
				);
			} else {
				// Collect for batch insert
				toInsert.push({
					contactId,
					propertyId: info.id,
					value: stringValue,
					organizationId,
					userId,
					createdAt: now,
					updatedAt: now,
				});
			}
		}

		// Execute updates (parallel) and single batch insert concurrently
		await Promise.all([
			...updateOps,
			toInsert.length > 0
				? db.insert(schema.contactPropertyValue).values(toInsert)
				: Promise.resolve(),
		]);
	} catch (error) {
		log.error("Error upserting contact properties", {
			contactId,
			error: error instanceof Error ? error.message : String(error),
		});
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
