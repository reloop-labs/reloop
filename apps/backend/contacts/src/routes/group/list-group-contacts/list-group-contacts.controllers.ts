import type { ContactModel } from "@be/contacts/model/contact.model";
import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  type SQL,
} from "drizzle-orm";

export async function listGroupContactsController({
  activeOrganizationId,
  group_id,
  query,
  logger,
}: {
  activeOrganizationId: string;
  group_id: string;
  query: ContactModel.ContactQuery;
  logger: Logger;
}): Promise<ContactTypes.GroupContactListResponse> {
  logger.info({ ...query, group_id }, "Listing contacts for group");
  try {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 100);
    const offset = (page - 1) * limit;

    // Fetch the group details first
    const group = await db.query.group.findFirst({
      where: and(
        eq(schema.group.id, group_id),
        eq(schema.group.organizationId, activeOrganizationId),
        isNull(schema.group.deletedAt),
      ),
    });

    if (!group) {
      logger.warn({ group_id }, "Group not found");
      throw new Error("Group not found");
    }

    // Base conditions for joining on contactGroup
    const whereConditions: Array<SQL<unknown>> = [
      eq(schema.contactGroup.groupId, group_id),
      eq(schema.contactGroup.organizationId, activeOrganizationId),
      isNull(schema.contactGroup.deletedAt),
      eq(schema.contact.organizationId, activeOrganizationId),
      isNull(schema.contact.deletedAt),
    ];

    if (query.status) {
      whereConditions.push(eq(schema.contact.status, query.status));
    }
    if (query.search) {
      whereConditions.push(ilike(schema.contact.email, `%${query.search}%`));
    }

    // Calculate Total Contacts in this Group
    const totalResult = await db
      .select({ count: count() })
      .from(schema.contactGroup)
      .innerJoin(
        schema.contact,
        eq(schema.contactGroup.contactId, schema.contact.id),
      )
      .where(and(...whereConditions));

    const total = totalResult[0]?.count || 0;

    // Calculate Summaries for the group
    const [
      totalSummaryResult,
      subscribedSummaryResult,
      unsubscribedSummaryResult,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(schema.contactGroup)
        .innerJoin(
          schema.contact,
          eq(schema.contactGroup.contactId, schema.contact.id),
        )
        .where(
          and(
            eq(schema.contactGroup.groupId, group_id),
            eq(schema.contactGroup.organizationId, activeOrganizationId),
            isNull(schema.contactGroup.deletedAt),
            eq(schema.contact.organizationId, activeOrganizationId),
            isNull(schema.contact.deletedAt),
          ),
        ),
      db
        .select({ count: count() })
        .from(schema.contactGroup)
        .innerJoin(
          schema.contact,
          eq(schema.contactGroup.contactId, schema.contact.id),
        )
        .where(
          and(
            eq(schema.contactGroup.groupId, group_id),
            eq(schema.contactGroup.organizationId, activeOrganizationId),
            isNull(schema.contactGroup.deletedAt),
            eq(schema.contact.status, "subscribed"),
            eq(schema.contact.organizationId, activeOrganizationId),
            isNull(schema.contact.deletedAt),
          ),
        ),
      db
        .select({ count: count() })
        .from(schema.contactGroup)
        .innerJoin(
          schema.contact,
          eq(schema.contactGroup.contactId, schema.contact.id),
        )
        .where(
          and(
            eq(schema.contactGroup.groupId, group_id),
            eq(schema.contactGroup.organizationId, activeOrganizationId),
            isNull(schema.contactGroup.deletedAt),
            eq(schema.contact.status, "unsubscribed"),
            eq(schema.contact.organizationId, activeOrganizationId),
            isNull(schema.contact.deletedAt),
          ),
        ),
    ]);

    const totalContacts = totalSummaryResult[0]?.count || 0;
    const subscribedContacts = subscribedSummaryResult[0]?.count || 0;
    const unsubscribedContacts = unsubscribedSummaryResult[0]?.count || 0;

    // Fetch the contacts in this group
    const contactRows = await db
      .select({ contact: schema.contact })
      .from(schema.contactGroup)
      .innerJoin(
        schema.contact,
        eq(schema.contactGroup.contactId, schema.contact.id),
      )
      .where(and(...whereConditions))
      .orderBy(desc(schema.contactGroup.createdAt))
      .limit(limit)
      .offset(offset);

    const contacts = contactRows.map((row) => row.contact);
    const contactIds = contacts.map((c) => c.id);

    // Map custom properties
    let propertyMap: Record<string, Record<string, string>> = {};
    if (contactIds.length > 0) {
      const allProperties = await db
        .select({
          contactId: schema.contactPropertyValue.contactId,
          name: schema.contactProperty.propertyName,
          value: schema.contactPropertyValue.value,
        })
        .from(schema.contactPropertyValue)
        .innerJoin(
          schema.contactProperty,
          eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
        )
        .where(inArray(schema.contactPropertyValue.contactId, contactIds));
      propertyMap = allProperties.reduce(
        (acc, curr) => {
          const cid = curr.contactId;
          if (!acc[cid]) {
            acc[cid] = {};
          }
          const contactProps = acc[cid];
          if (contactProps) {
            contactProps[curr.name] = curr.value;
          }
          return acc;
        },
        {} as Record<string, Record<string, string>>,
      );
    }

    const formattedContacts = contacts.map((contact) =>
      formatContactResponse({
        ...contact,
        properties: propertyMap[contact.id] || {},
      }),
    );

    logger.info(
      { total, page, limit, group_id },
      "Group contacts listed successfully",
    );

    return {
      object: "contact_group",
      group: {
        id: group.id,
        name: group.name,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        contacts: formattedContacts,
      },
      total,
      page,
      limit,
      totalContacts,
      subscribedContacts,
      unsubscribedContacts,
    };
  } catch (error) {
    logger.error({ query, group_id, error }, "Error listing group contacts");
    throw error;
  }
}
