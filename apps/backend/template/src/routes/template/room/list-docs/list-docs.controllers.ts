import type { YjsPersistence } from "@be/template/utils/persistence";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export async function listDocsController(
	persistence: YjsPersistence | null,
	organizationId: string,
) {
	if (!persistence) {
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

	return { docs: docs.filter((d) => allowedIds.has(d)) };
}
