import type { GroupModel } from "@be/contacts/model/group.model";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { GROUP_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

export const deleteGroupController = async ({
	activeOrganizationId,
	group_id,
	logger,
	cookie,
	requestDetails,
}: {
	activeOrganizationId: string;
	group_id: string;
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
	| {
			object: "contact_group";
			success: boolean;
			id: string;
			name: string;
			event: string;
	  }
	| GroupModel.GroupNotFound
	| GroupModel.Unauthorized
> => {
	logger.info({ group_id }, "Deleting group");

	try {
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!group) {
			logger.warn({ group_id }, "Group not found for deletion");
			return { message: "Group not found" };
		}

		await db
			.update(schema.group)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(schema.group.id, group_id),
					eq(schema.group.organizationId, activeOrganizationId),
				),
			);

		logger.info({ group_id }, "Group soft-deleted successfully");

		const result = {
			object: "contact_group" as const,
			success: true,
			id: group.id,
			name: group.name,
			event: GROUP_DELETE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: GROUP_DELETE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 200 },
		});

		return result;
	} catch (error) {
		logger.error({ group_id, error }, "Debug deleting group");
		throw error;
	}
};
