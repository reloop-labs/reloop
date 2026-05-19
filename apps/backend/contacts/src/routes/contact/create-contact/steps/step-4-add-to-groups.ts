import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
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
	if (groupIds && groupIds.length > 0) {
		log.info("Adding contact to groups");
		await db.insert(schema.contactGroup).values(
			groupIds.map((groupId) => ({
				contactId,
				groupId,
				organizationId,
				userId,
			})),
		);
	}
}
