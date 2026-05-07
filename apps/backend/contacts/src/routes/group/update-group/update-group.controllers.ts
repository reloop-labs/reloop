import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { GROUP_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull, ne } from "drizzle-orm";

export const updateGroupController = async ({
	activeOrganizationId,
	group_id,
	body,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	group_id: string;
	body: GroupModel.UpdateGroupBody;
	logger: Logger;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<
	| GroupResponse
	| GroupModel.GroupNotFound
	| GroupModel.GroupAlreadyExists
	| GroupModel.Unauthorized
> => {
	const { name } = body;

	logger.info({ group_id, name }, "Updating group");

	try {
		const existingGroup = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!existingGroup) {
			logger.warn({ group_id }, "Group not found for update");
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
				logger.warn({ name }, "Another group with this name already exists");
				return { message: "Group already exists" };
			}
		}

		const [updatedGroup] = await db
			.update(schema.group)
			.set({ name, updatedAt: new Date() })
			.where(eq(schema.group.id, group_id))
			.returning();

		if (!updatedGroup) {
			logger.error({ group_id }, "Failed to update group - no data returned");
			return { message: "Group not found" };
		}

		logger.info({ group_id }, "Group updated successfully");

		const result = {
			id: updatedGroup.id,
			name: updatedGroup.name,
			createdAt: updatedGroup.createdAt,
			updatedAt: updatedGroup.updatedAt,
			object: "contact_group" as const,
			event: GROUP_UPDATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: GROUP_UPDATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		logger.error({ group_id, error }, "Debug updating group");
		throw error;
	}
};
