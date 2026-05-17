import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { createGroupId } from "@reloop/db/schema";
import { GROUP_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export const createGroupController = async ({
	name,
	activeOrganizationId,
	userId,
	logger,
	cookie,
	requestDetails,
}: {
	name: string;
	activeOrganizationId: string;
	userId: string;
	logger?: any;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
}): Promise<GroupResponse | GroupModel.Unauthorized> => {
	log.info({ ...{ name }, message: "Creating group" });
	try {
		log.info({ ...{ name }, message: "Checking if group already exists" });
		const existingGroup = await db.query.group.findFirst({
			where: and(
				eq(schema.group.name, name),
				eq(schema.group.organizationId, activeOrganizationId),
				isNull(schema.group.deletedAt),
			),
		});
		if (existingGroup) {
			log.warn({ ...{ name }, message: "Group already exists" });
			throw new Error("Group already exists");
		}
		const [newGroup] = await db
			.insert(schema.group)
			.values({
				id: createGroupId(),
				name,
				organizationId: activeOrganizationId,
				userId,
			})
			.returning();
		if (!newGroup) {
			log.error({
				...{ name },
				message: "Failed to create group - no data returned",
			});
			throw new Error("Failed to create group");
		}
		log.info({
			...{ name, id: newGroup.id },
			message: "Group created successfully",
		});

		const result = {
			id: newGroup.id,
			name: newGroup.name,
			createdAt: newGroup.createdAt,
			updatedAt: newGroup.updatedAt,
			object: "contact_group" as const,
			event: GROUP_CREATE_WEBHOOK_EVENT.id,
		};

		await createLog({
			event: GROUP_CREATE_WEBHOOK_EVENT.id,
			cookie,
			metadata: result,
			requestDetails: { ...(requestDetails || {}), statusCode: 201 },
		});

		return result;
	} catch (error) {
		log.error({ ...{ name, error }, message: "Debug creating group" });
		throw error;
	}
};
