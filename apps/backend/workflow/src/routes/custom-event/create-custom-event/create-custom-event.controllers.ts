import { CustomEventErrors } from "@be/workflow/error/custom-event.error-response";
import {
	isValidEventKey,
	normalizeEventKey,
	slugifyEventKeyFromName,
} from "@be/workflow/lib/custom-event/key";
import { mapCustomEvent } from "@be/workflow/routes/custom-event/custom-event.mappers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

type PropertyInput = {
	name: string;
	propertyType?: "string" | "number" | "boolean";
	required?: boolean;
	defaultValue?: string | null;
	description?: string | null;
};

export async function createCustomEventController(params: {
	organizationId: string;
	userId: string;
	name: string;
	key?: string;
	description?: string;
	properties?: PropertyInput[];
}) {
	const name = params.name.trim();
	const key = normalizeEventKey(
		params.key?.trim() || slugifyEventKeyFromName(name),
	);

	if (!isValidEventKey(key)) {
		throw CustomEventErrors.invalidKey(key);
	}

	const existing = await db.query.customEvent.findFirst({
		where: and(
			eq(schema.customEvent.organizationId, params.organizationId),
			eq(schema.customEvent.key, key),
			isNull(schema.customEvent.deletedAt),
		),
		columns: { id: true },
	});
	if (existing) throw CustomEventErrors.keyExists(key);

	const props = dedupeProperties(params.properties ?? []);

	try {
		const [row] = await db
			.insert(schema.customEvent)
			.values({
				organizationId: params.organizationId,
				userId: params.userId,
				name,
				key,
				description: params.description?.trim() || null,
			})
			.returning();

		if (!row) throw CustomEventErrors.createFailed();

		let propertyRows: (typeof schema.customEventProperty.$inferSelect)[] = [];
		if (props.length > 0) {
			propertyRows = await db
				.insert(schema.customEventProperty)
				.values(
					props.map((p) => ({
						eventId: row.id,
						organizationId: params.organizationId,
						name: p.name,
						propertyType: p.propertyType ?? "string",
						required: p.required ?? false,
						defaultValue: p.defaultValue ?? null,
						description: p.description ?? null,
					})),
				)
				.returning();
		}

		return mapCustomEvent(row, propertyRows);
	} catch (error) {
		log.error({
			message: "Error creating custom event",
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) throw error;
		throw CustomEventErrors.createFailed();
	}
}

function dedupeProperties(props: PropertyInput[]): PropertyInput[] {
	const seen = new Set<string>();
	const out: PropertyInput[] = [];
	for (const p of props) {
		const name = p.name.trim();
		if (!name || seen.has(name)) continue;
		seen.add(name);
		out.push({ ...p, name });
	}
	return out;
}
