import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function addToGroups_step4({
	contactId,
	groupIds,
	organizationId,
	userId,
	db,
}: {
	contactId: string;
	groupIds?: string[];
	organizationId: string;
	userId: string;
	db: DatabaseInstance;
}) {
	const log = useLogger();
	if (!groupIds || groupIds.length === 0) return;

	// H-3 fix: validate that every supplied groupId belongs to the caller's org
	// before inserting. Silently drops IDs that don't belong to prevent cross-tenant
	// data pollution.
	const validGroups = await db
		.select({ id: schema.group.id })
		.from(schema.group)
		.where(
			and(
				inArray(schema.group.id, groupIds),
				eq(schema.group.organizationId, organizationId),
				isNull(schema.group.deletedAt),
			),
		);

	const validGroupIds = validGroups.map((g) => g.id);

	const dropped = groupIds.length - validGroupIds.length;
	if (dropped > 0) {
		log.warn("Dropped group IDs that do not belong to the organization", {
			organizationId,
			dropped,
		});
	}

	if (validGroupIds.length > 0) {
		log.info("Adding contact to groups");
		await db.insert(schema.contactGroup).values(
			validGroupIds.map((groupId) => ({
				contactId,
				groupId,
				organizationId,
				userId,
			})),
		);
	}
}
