import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import { schema } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";

export const deleteGroup = async ({
  params,
  activeOrganizationId,
  logger,
}: {
  params: { groupId: string };
  activeOrganizationId: string;
  logger: any;
}): Promise<
  | GroupModel.DeleteResponse
  | GroupModel.GroupNotFound
  | GroupModel.Unauthorized
> => {
  const { groupId } = params;

  logger.info(
    { organizationId: activeOrganizationId, groupId },
    "Deleting group",
  );

  try {
    const result = await db
      .update(schema.group)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.group.id, groupId),
          eq(schema.group.organizationId, activeOrganizationId),
        ),
      );

    if (result.rowCount === 0) {
      logger.warn({ groupId }, "Group not found for deletion");
      return { message: "Group not found" };
    }

    logger.info({ groupId }, "Group soft-deleted successfully");
    return { success: true };
  } catch (error) {
    logger.error(
      {
        groupId,
        organizationId: activeOrganizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting group",
    );
    throw error;
  }
};

export async function deleteGroupHandler(
  params: {
    organizationId: string;
    groupId: string;
  },
  logger: Logger,
): Promise<{ success: boolean }> {
  return await deleteGroup(params, logger);
}
