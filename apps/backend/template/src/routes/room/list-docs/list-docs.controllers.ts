import type { YjsPersistence } from "@be/template/utils/persistence";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export async function listDocsController(
	persistence: YjsPersistence | null,
	organizationId: string,
) {
	log.info({
		organizationId,
		message: "Listing collaboration room documents",
	});

	try {
		if (!persistence) {
			log.warn({
				organizationId,
				message: "Persistence not available for listing documents",
			});
			return { docs: [] };
		}

		const docs = await persistence.listDocs();

		const templates = await db
			.select({ id: schema.template.id })
			.from(schema.template)
			.where(
				and(
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
				),
			);
		const allowedIds = new Set(templates.map((t) => t.id));

		const filteredDocs = docs.filter((d) => allowedIds.has(d));

		log.info({
			organizationId,
			totalDocs: docs.length,
			filteredDocs: filteredDocs.length,
			message: "Successfully listed collaboration room documents",
		});

		return { docs: filteredDocs };
	} catch (error) {
		log.error({
			organizationId,
			message: "Error listing collaboration room documents",
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
