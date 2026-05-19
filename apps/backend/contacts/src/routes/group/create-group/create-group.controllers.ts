import {
	ContactErrors,
	GroupErrors,
} from "@be/contacts/error/contacts.error-response";
import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { createGroupId } from "@reloop/db/schema";
import { GROUP_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const createGroupController = async ({
	name,
	organizationId,
	userId,
}: {
	name: string;
	organizationId: string;
	userId: string;
}): Promise<GroupResponse | GroupModel.Unauthorized> => {
	const log = useLogger();
	log.info("Creating group", { name });
	try {
		log.info("Checking if group already exists", { name });
		const existingGroup = await db.query.group.findFirst({
			where: and(
				eq(schema.group.name, name),
				eq(schema.group.organizationId, organizationId),
				isNull(schema.group.deletedAt),
			),
		});
		if (existingGroup) {
			log.warn("Group already exists", { name });
			throw GroupErrors.alreadyExists(name);
		}
		const [newGroup] = await db
			.insert(schema.group)
			.values({
				id: createGroupId(),
				name,
				organizationId: organizationId,
				userId,
			})
			.returning();
		if (!newGroup) {
			log.error("Failed to create group - no data returned", { name });
			throw ContactErrors.createFailed("Failed to create group");
		}
		log.info("Group created successfully", { name, id: newGroup.id });

		const result = {
			id: newGroup.id,
			name: newGroup.name,
			createdAt: newGroup.createdAt,
			updatedAt: newGroup.updatedAt,
			object: "contact_group" as const,
			event: GROUP_CREATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Debug creating group", {
			name,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
