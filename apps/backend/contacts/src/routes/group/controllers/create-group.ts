import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { createGroupId } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export const createGroup = async ({
  body,
  activeOrganizationId,
  userId,
  logger,
}: {
  body: GroupModel.CreateGroupBody;
  activeOrganizationId: string;
  userId: string;
  logger: Logger;
}): Promise<GroupTypes.GroupResponse | GroupModel.Unauthorized> => {
  const { name } = body;
  logger.info({ organizationId: activeOrganizationId, name }, "Creating group");
  try {
    // Check if group with same name already exists
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
    return {
      ...newGroup,
      object: "contact_group" as const,
    } as GroupTypes.GroupResponse;
  } catch (error) {
    logger.error(
      {
        name,
        organizationId: activeOrganizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating group",
    );
    throw error;
  }
};

export async function createGroupHandler(
  params: {
    organizationId: string;
    userId: string;
    name: string;
  },
  logger: Logger,
): Promise<GroupTypes.GroupResponse> {
  const result = await createGroup({
    body: { name: params.name },
    activeOrganizationId: params.organizationId,
    userId: params.userId,
    logger,
  });
  return result as GroupTypes.GroupResponse;
}
