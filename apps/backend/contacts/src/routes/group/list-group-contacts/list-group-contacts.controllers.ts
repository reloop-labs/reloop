import {
	ContactErrors,
	GroupErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { GROUP_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export const listGroupContactsController = async ({
	organizationId,
	group_id,
	query,
}: {
	organizationId: string;
	group_id: string;
	query: {
		page?: number;
		limit?: number;
		cursor?: string;
	};
}): Promise<
	| ContactModel.GroupContactListResponse
	| GroupModel.GroupNotFound
	| GroupModel.Unauthorized
> => {
	const log = useLogger();
	const page = query.page || 1;
	const limit = Math.min(query.limit || 100, 100);
	// With a cursor, pagination is keyset-based and `page` is ignored. Pages
	// follow membership order (contact_group created_at, id), oldest first.
	const position = query.cursor ? decodeCursor(query.cursor) : null;
	const offset = position ? 0 : (page - 1) * limit;

	log.info("Listing group contacts", { group_id, page, limit });

	try {
		const memberWhere = and(
			eq(schema.contactGroup.groupId, group_id),
			eq(schema.contactGroup.organizationId, organizationId),
			isNull(schema.contactGroup.deletedAt),
		);

		// Run group fetch and member status counts in parallel
		const [group, statusCountRows] = await Promise.all([
			db.query.group.findFirst({
				where: and(
					eq(schema.group.id, group_id),
					eq(schema.group.organizationId, organizationId),
					isNull(schema.group.deletedAt),
				),
			}),
			db
				.select({
					status: schema.contact.status,
					count: sql<number>`COUNT(*)`,
				})
				.from(schema.contactGroup)
				.innerJoin(
					schema.contact,
					eq(schema.contactGroup.contactId, schema.contact.id),
				)
				.where(and(memberWhere, isNull(schema.contact.deletedAt)))
				.groupBy(schema.contact.status),
		]);

		if (!group) {
			log.warn("Group not found", { group_id });
			throw GroupErrors.notFound(group_id);
		}

		let subscribedContacts = 0;
		let unsubscribedContacts = 0;
		let total = 0;
		for (const row of statusCountRows) {
			const count = Number(row.count ?? 0);
			total += count;
			if (row.status === "subscribed") subscribedContacts = count;
			else if (row.status === "unsubscribed") unsubscribedContacts = count;
		}

		// Fetch paginated contacts with properties via contactGroup relation
		const rows = await db.query.contactGroup.findMany({
			where: position
				? and(memberWhere, afterCursor(schema.contactGroup, position, "asc"))
				: memberWhere,
			limit: limit + 1,
			offset,
			orderBy: cursorOrderBy(schema.contactGroup, "asc"),
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

		const { items, hasMore, nextCursor } = toCursorPage(rows, limit);

		const contactList = items
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

		log.info("Group contacts listed", {
			group_id,
			total,
			page,
			limit,
			returned: contactList.length,
		});

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
			subscribedContacts,
			unsubscribedContacts,
			page,
			limit,
			hasMore,
			nextCursor,
			event: GROUP_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error listing group contacts", {
			group_id,
			error: error instanceof Error ? error.message : String(error),
		});
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
};
