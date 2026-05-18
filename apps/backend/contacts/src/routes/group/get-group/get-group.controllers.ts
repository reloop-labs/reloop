import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { GROUP_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

export const getGroupController = async ({
	activeOrganizationId,
	group_id,
	logger,
}: {
	activeOrganizationId: string;
	group_id: string;
	logger?: any;
}): Promise<
	GroupResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
	logger?.info("Getting group", { group_id });
	try {
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});
		if (!group) {
			logger?.warn("Group not found", { group_id });
			return { message: "Group not found" };
		}
		logger?.info("Group retrieved successfully", { group_id });
		return {
			...group,
			object: "contact_group",
			event: GROUP_GET_WEBHOOK_EVENT.id,
		} as GroupResponse;
	} catch (error) {
		logger?.error("Debug getting group", { group_id, error });
		throw error;
	}
};
