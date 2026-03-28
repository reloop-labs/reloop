import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export const getGroup = async (
  activeOrganizationId: string,
  group_id: string,
  logger: Logger,
): Promise<
  GroupTypes.GroupResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
  logger.info(
    { organizationId: activeOrganizationId, group_id },
    "Getting group",
  );

  try {
    const group = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, group_id),
        eq(schema.group.organizationId, activeOrganizationId),
        isNull(schema.group.deletedAt),
      ),
    });

    if (!group) {
      logger.warn({ group_id }, "Group not found");
      return { message: "Group not found" };
    }

    return {
      ...group,
      object: "contact_group" as const,
    } as GroupTypes.GroupResponse;
  } catch (error) {
    logger.error(
      {
        group_id,
        organizationId: activeOrganizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting group",
    );
    throw error;
  }
};

export async function getGroupController(
  organizationId: string,
  group_id: string,
  logger: Logger,
): Promise<GroupTypes.GroupResponse> {
  const result = await getGroup(organizationId, group_id, logger);
  return result as GroupTypes.GroupResponse;
}
