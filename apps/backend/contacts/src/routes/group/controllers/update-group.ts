import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull, ne } from "drizzle-orm";

export const updateGroup = async ({
  body,
  params,
  activeOrganizationId,
  logger,
}: {
  body: GroupModel.UpdateGroupBody;
  params: { contact_group_id: string };
  activeOrganizationId: string;
  logger: Logger;
}): Promise<
  GroupTypes.GroupResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
  const { contact_group_id } = params;
  const { name } = body;
  const organizationId = activeOrganizationId;

  logger.info({ organizationId, contact_group_id, name }, "Updating group");

  try {
    const existingGroup = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, contact_group_id),
        eq(schema.group.organizationId, organizationId),
        isNull(schema.group.deletedAt),
      ),
    });

    if (!existingGroup) {
      logger.warn({ contact_group_id }, "Group not found for update");
      return { message: "Group not found" };
    }

    // Check name uniqueness if changed
    if (name !== existingGroup.name) {
      const nameConflict = await db.query.group.findFirst({
        where: and(
          eq(schema.group.name, name),
          eq(schema.group.organizationId, organizationId),
          ne(schema.group.id, contact_group_id),
          isNull(schema.group.deletedAt),
        ),
      });

      if (nameConflict) {
        logger.warn({ name }, "Another group with this name already exists");
        return {
          message: "Another group with this name already exists",
        } as any;
      }
    }

    const [updatedGroup] = await db
      .update(schema.group)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(schema.group.id, contact_group_id))
      .returning();

    if (!updatedGroup) {
      logger.error({ contact_group_id }, "Failed to update group - no data returned");
      return { message: "Group not found" };
    }

    return {
      ...updatedGroup,
      object: "contact_group" as const,
    } as GroupTypes.GroupResponse;
  } catch (error) {
    logger.error(
      {
        contact_group_id,
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
    contact_group_id: string;
    name: string;
  },
  logger: Logger,
): Promise<GroupTypes.GroupResponse> {
  const result = await updateGroup({
    body: { name: params.name },
    params: { contact_group_id: params.contact_group_id },
    activeOrganizationId: params.organizationId,
    logger,
  });
  return result as GroupTypes.GroupResponse;
}
