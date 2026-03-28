import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export const deleteGroupController = async ({
  activeOrganizationId,
  group_id,
  logger,
}: {
  activeOrganizationId: string;
  group_id: string;
  logger: Logger;
}): Promise<
  GroupModel.DeleteResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
  logger.info({ group_id }, "Deleting group");

  try {
    const result = await db
      .update(schema.group)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.group.id, group_id),
          eq(schema.group.organizationId, activeOrganizationId),
        ),
      );

    if (result.rowCount === 0) {
      logger.warn({ group_id }, "Group not found for deletion");
      return { message: "Group not found" };
    }

    logger.info({ group_id }, "Group soft-deleted successfully");
    return { object: "contact_group" as const, success: true };
  } catch (error) {
    logger.error({ group_id, error }, "Debug deleting group");
    throw error;
  }
};
