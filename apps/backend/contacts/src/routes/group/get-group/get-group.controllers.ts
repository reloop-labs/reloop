import { log } from "evlog";
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
	log.info({ ...({ group_id }), message: "Getting group" });
	try {
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});
		if (!group) {
			log.warn({ ...({ group_id }), message: "Group not found" });
			return { message: "Group not found" };
		}
		log.info({ ...({ group_id }), message: "Group retrieved successfully" });
		return {
			...group,
			object: "contact_group",
			event: GROUP_GET_WEBHOOK_EVENT.id,
		} as GroupResponse;
	} catch (error) {
		log.error({ ...({ group_id, error }), message: "Debug getting group" });
		throw error;
	}
};
