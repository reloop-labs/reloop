import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { GROUP_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull, ne } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const updateGroupController = async ({
	activeOrganizationId,
	group_id,
	name,
}: {
	activeOrganizationId: string;
	group_id: string;
} & GroupModel.UpdateGroupBody): Promise<
	| GroupResponse
	| GroupModel.GroupNotFound
	| GroupModel.GroupAlreadyExists
	| GroupModel.Unauthorized
> => {
	const logger = useLogger();

	logger?.info("Updating group", { group_id, name });

	try {
		const existingGroup = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!existingGroup) {
			logger?.warn("Group not found for update", { group_id });
			return { message: "Group not found" };
		}

		// Check name uniqueness if changed
		if (name !== existingGroup.name) {
			const nameConflict = await db.query.group.findFirst({
				where: and(
					eq(schema.group.name, name),
					eq(schema.group.organizationId, activeOrganizationId),
					ne(schema.group.id, group_id),
					isNull(schema.group.deletedAt),
				),
			});

			if (nameConflict) {
				logger?.warn("Another group with this name already exists", { name });
				return { message: "Group already exists" };
			}
		}

		const [updatedGroup] = await db
			.update(schema.group)
			.set({ name, updatedAt: new Date() })
			.where(eq(schema.group.id, group_id))
			.returning();

		if (!updatedGroup) {
			logger?.error("Failed to update group - no data returned", { group_id });
			return { message: "Group not found" };
		}

		logger?.info("Group updated successfully", { group_id });

		const result = {
			id: updatedGroup.id,
			name: updatedGroup.name,
			createdAt: updatedGroup.createdAt,
			updatedAt: updatedGroup.updatedAt,
			object: "contact_group" as const,
			event: GROUP_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		logger?.error("Debug updating group", {
			group_id,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
