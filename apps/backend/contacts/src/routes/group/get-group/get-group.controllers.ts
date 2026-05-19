import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { GroupErrors } from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { GROUP_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const getGroupController = async ({
	organizationId,
	group_id,
}: {
	organizationId: string;
	group_id: string;
}): Promise<
	GroupResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
	const log = useLogger();
	log.info("Getting group", { group_id });
	try {
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, group_id),
				eq(schema.group.organizationId, organizationId),
				isNull(schema.group.deletedAt),
			),
		});
		if (!group) {
			log.warn("Group not found", { group_id });
			throw GroupErrors.notFound(group_id);
		}
		log.info("Group retrieved successfully", { group_id });
		return {
			...group,
			object: "contact_group",
			event: GROUP_GET_WEBHOOK_EVENT.id,
		} as GroupResponse;
	} catch (error) {
		log.error("Debug getting group", {
			group_id,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
};
