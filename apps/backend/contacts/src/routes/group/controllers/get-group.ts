import type { GroupModel } from "@be/contacts/model/group.model";
import type { GroupTypes } from "@be/contacts/types/group.type";
import { db } from "@reloop/db/client";
import { schema } from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

export const getGroup = async ({
  params,
  activeOrganizationId,
  logger,
}: {
  params: { groupId: string };
  activeOrganizationId: string;
  logger: any;
}): Promise<
  | GroupTypes.GroupResponse
  | GroupModel.GroupNotFound
  | GroupModel.Unauthorized
> => {
  const { groupId } = params;

  logger.info(
    { organizationId: activeOrganizationId, groupId },
    "Getting group",
  );

  try {
    const group = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, groupId),
        eq(schema.group.organizationId, activeOrganizationId),
        isNull(schema.group.deletedAt),
      ),
    });

    if (!group) {
      logger.warn({ groupId }, "Group not found");
      return { message: "Group not found" };
    }

    return {
      ...group,
      object: "contact_group" as const,
    };
  } catch (error) {
    logger.error(
      {
        groupId,
        organizationId: activeOrganizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting group",
    );
    throw error;
  }
};

export async function getGroupHandler(
  params: {
    organizationId: string;
    groupId: string;
  },
  logger: Logger,
): Promise<GroupTypes.GroupResponse> {
  return await getGroup(params, logger);
}
