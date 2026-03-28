import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull, ne } from "drizzle-orm";

export const updateGroupController = async (
  activeOrganizationId: string,
  group_id: string,
  body: GroupModel.UpdateGroupBody,
  logger: Logger,
): Promise<
  | GroupTypes.GroupResponse
  | GroupModel.GroupNotFound
  | GroupModel.GroupAlreadyExists
  | GroupModel.Unauthorized
> => {
  const { name } = body;
  const organizationId = activeOrganizationId;

  logger.info({ organizationId, group_id, name }, "Updating group");

  try {
    const existingGroup = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, group_id),
        eq(schema.group.organizationId, organizationId),
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
          eq(schema.group.organizationId, organizationId),
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

    return {
      ...updatedGroup,
      object: "contact_group" as const,
    } as GroupTypes.GroupResponse;
  } catch (error) {
    logger.error(
      {
        group_id,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating group",
    );
    throw error;
  }
};
