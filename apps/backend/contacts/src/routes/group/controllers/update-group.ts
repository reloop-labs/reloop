import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import { schema } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull, ne } from "drizzle-orm";

export const updateGroup = async ({
  body,
  params,
  activeOrganizationId,
  logger,
}: {
  body: GroupModel.UpdateGroupBody;
  params: { groupId: string };
  activeOrganizationId: string;
  logger: Logger;
}): Promise<
  | GroupTypes.GroupResponse
  | GroupModel.GroupNotFound
  | GroupModel.Unauthorized
> => {
  const { groupId } = params;
  const { name } = body;
  const organizationId = activeOrganizationId;

  logger.info({ organizationId, groupId, name }, "Updating group");

  try {
    const existingGroup = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, groupId),
        eq(schema.group.organizationId, organizationId),
        isNull(schema.group.deletedAt),
      ),
    });

    if (!existingGroup) {
      logger.warn({ groupId }, "Group not found for update");
      return { message: "Group not found" };
    }

    // Check name uniqueness if changed
    if (name !== existingGroup.name) {
      const nameConflict = await db.query.group.findFirst({
        where: and(
          eq(schema.group.name, name),
          eq(schema.group.organizationId, organizationId),
          ne(schema.group.id, groupId),
          isNull(schema.group.deletedAt),
        ),
      });

      if (nameConflict) {
        logger.warn(
          { name },
          "Another group with this name already exists",
        );
        return {
          message: "Another group with this name already exists",
        };
      }
    }

    const [updatedGroup] = await db
      .update(schema.group)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(schema.group.id, groupId))
      .returning();

    if (!updatedGroup) {
      logger.error(
        { groupId },
        "Failed to update group - no data returned",
      );
      return { message: "Group not found" };
    }

    return {
      ...updatedGroup,
      object: "contact_group" as const,
    };
  } catch (error) {
    logger.error(
      {
        groupId,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating group",
    );
    throw error;
  }
};

export async function updateGroupHandler(
  params: {
    organizationId: string;
    groupId: string;
    name: string;
  },
  logger: Logger,
): Promise<GroupTypes.GroupResponse> {
  return await updateGroup(params, logger);
}
