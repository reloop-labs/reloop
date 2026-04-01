import type { ContactModel } from "@be/contacts/model/contact.model";
import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { GROUP_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, asc, eq, isNull, sql } from "drizzle-orm";

export const listGroupContactsController = async ({
  activeOrganizationId,
  group_id,
  query,
  logger,
}: {
  activeOrganizationId: string;
  group_id: string;
  query: {
    page?: number;
    limit?: number;
  };
  logger: Logger;
}): Promise<
  ContactModel.GroupContactListResponse | GroupModel.GroupNotFound | GroupModel.Unauthorized
> => {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 100, 100);
  const offset = (page - 1) * limit;

  logger.info({ group_id, page, limit }, "Listing group contacts");

  try {
    const memberWhere = and(
      eq(schema.contactGroup.groupId, group_id),
      eq(schema.contactGroup.organizationId, activeOrganizationId),
      isNull(schema.contactGroup.deletedAt),
    );

    // Run group fetch and count in parallel
    const [group, countResult] = await Promise.all([
      db.query.group.findFirst({
        where: and(
          eq(schema.group.id, group_id),
          eq(schema.group.organizationId, activeOrganizationId),
          isNull(schema.group.deletedAt),
        ),
      }),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.contactGroup)
        .where(memberWhere),
    ]);

    if (!group) {
      logger.warn({ group_id }, "Group not found");
      return { message: "Group not found" };
    }

    const total = Number(countResult[0]?.count ?? 0);

    // Fetch paginated contacts with properties via contactGroup relation
    const rows = await db.query.contactGroup.findMany({
      where: memberWhere,
      limit,
      offset,
      orderBy: asc(schema.contactGroup.createdAt),
      with: {
        contact: {
          with: {
            propertyValues: {
              where: isNull(schema.contactPropertyValue.deletedAt),
              with: { property: true },
            },
          },
        },
      },
    });

    const contactList = rows
      .filter(({ contact }) => contact.deletedAt === null)
      .map(({ contact }) => {
        const properties = contact.propertyValues.reduce(
          (acc, pv) => {
            acc[pv.property.propertyName] = pv.value;
            return acc;
          },
          {} as Record<string, string>,
        );

        return {
          id: contact.id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          status: contact.status as "subscribed" | "unsubscribed" | "blocked",
          properties,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
        };
      });

    logger.info({ group_id, total, page, limit, returned: contactList.length }, "Group contacts listed");

    return {
      object: "contact_group",
      group: {
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        contacts: contactList,
      },
      total,
      page,
      limit,
      event: GROUP_LIST_WEBHOOK_EVENT.id,
    };
  } catch (error) {
    logger.error({ group_id, error }, "Error listing group contacts");
    throw error;
  }
};
