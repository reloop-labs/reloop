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
		// Restore soft-deleted memberships (e.g. contact recreate) instead of
		// INSERT → contact_group_unique conflict.
		await db
			.insert(schema.contactGroup)
			.values(
				validGroupIds.map((groupId) => ({
					contactId,
					groupId,
					organizationId,
					userId,
				})),
			)
			.onConflictDoUpdate({
				target: [schema.contactGroup.contactId, schema.contactGroup.groupId],
				set: {
					deletedAt: null,
					updatedAt: new Date(),
				},
			});
	}
}
