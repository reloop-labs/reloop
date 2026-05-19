import {
	ContactErrors,
	GroupErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import type { GroupModel } from "@be/contacts/model/group.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { GROUP_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
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
	};
}): Promise<
	| ContactModel.GroupContactListResponse
	| GroupModel.GroupNotFound
	| GroupModel.Unauthorized
> => {
	const log = useLogger();
	const page = query.page || 1;
	const limit = Math.min(query.limit || 100, 100);
	const offset = (page - 1) * limit;

	log.info("Listing group contacts", { group_id, page, limit });

	try {
		const memberWhere = and(
			eq(schema.contactGroup.groupId, group_id),
			eq(schema.contactGroup.organizationId, organizationId),
			isNull(schema.contactGroup.deletedAt),
		);

		// Run group fetch and count in parallel
		const [group, countResult] = await Promise.all([
			db.query.group.findFirst({
				where: and(
					eq(schema.group.id, group_id),
					eq(schema.group.organizationId, organizationId),
					isNull(schema.group.deletedAt),
				),
			}),
			db
				.select({ count: sql<number>`COUNT(*)` })
				.from(schema.contactGroup)
				.where(memberWhere),
		]);

		if (!group) {
			log.warn("Group not found", { group_id });
			throw GroupErrors.notFound(group_id);
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
			page,
			limit,
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
