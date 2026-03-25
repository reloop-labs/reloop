import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";

export const deleteGroup = async ({
  params,
  activeOrganizationId,
  logger,
}: {
  params: { contact_group_id: string };
  activeOrganizationId: string;
  logger: any;
}): Promise<
  | GroupModel.DeleteResponse
  | GroupModel.GroupNotFound
  | GroupModel.Unauthorized
> => {
  const { contact_group_id } = params;

  logger.info(
    { organizationId: activeOrganizationId, contact_group_id },
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
          eq(schema.group.id, contact_group_id),
          eq(schema.group.organizationId, activeOrganizationId),
        ),
      );

    if (result.rowCount === 0) {
      logger.warn({ contact_group_id }, "Group not found for deletion");
      return { message: "Group not found" };
    }

    logger.info({ contact_group_id }, "Group soft-deleted successfully");
    return { success: true };
  } catch (error) {
    logger.error(
      {
        contact_group_id,
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
    contact_group_id: string;
  },
  logger: Logger,
): Promise<{ success: boolean }> {
  const result = await deleteGroup({
    params: { contact_group_id: params.contact_group_id },
    activeOrganizationId: params.organizationId,
    logger,
  });
  return result as { success: boolean };
}
