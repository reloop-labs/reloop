import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupResponse } from "@be/contacts/types/group.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { createGroupId } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { GROUP_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

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
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}): Promise<GroupResponse | GroupModel.Unauthorized> => {
  logger.info({ name }, "Creating group");
  try {
    logger.info({ name }, "Checking if group already exists");
    const existingGroup = await db.query.group.findFirst({
      where: and(
        eq(schema.group.name, name),
        eq(schema.group.organizationId, activeOrganizationId),
        isNull(schema.group.deletedAt),
      ),
    });
    if (existingGroup) {
      logger.warn({ name }, "Group already exists");
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
      logger.error({ name }, "Failed to create group - no data returned");
      throw new Error("Failed to create group");
    }
    logger.info({ name, id: newGroup.id }, "Group created successfully");

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
      requestDetails,
    });

    return result;
  } catch (error) {
    logger.error({ name, error }, "Debug creating group");
    throw error;
  }
};
