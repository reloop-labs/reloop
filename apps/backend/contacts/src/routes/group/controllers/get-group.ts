import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export const getGroup = async ({
	params,
	activeOrganizationId,
	logger,
}: {
	params: { contact_group_id: string };
	activeOrganizationId: string;
	logger: Logger;
}): Promise<
	GroupTypes.GroupResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
	const { contact_group_id } = params;

	logger.info(
		{ organizationId: activeOrganizationId, contact_group_id },
		"Getting group",
	);

	try {
		const group = await db.query.group.findFirst({
			where: and(
				eq(schema.group.id, contact_group_id),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});

		if (!group) {
			logger.warn({ contact_group_id }, "Group not found");
			return { message: "Group not found" };
		}

		return {
			...group,
			object: "contact_group" as const,
		} as GroupTypes.GroupResponse;
	} catch (error) {
		logger.error(
			{
				contact_group_id,
				organizationId: activeOrganizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting group",
		);
		throw error;
	}
};

export async function getGroupHandler(
	params: {
		organizationId: string;
		contact_group_id: string;
	},
	logger: Logger,
): Promise<GroupTypes.GroupResponse> {
	const result = await getGroup({
		params: { contact_group_id: params.contact_group_id },
		activeOrganizationId: params.organizationId,
		logger,
	});
	return result as GroupTypes.GroupResponse;
}
