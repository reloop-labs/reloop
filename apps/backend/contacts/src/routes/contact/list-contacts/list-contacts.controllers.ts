import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
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
import { log } from "evlog";

export async function listContactsController({
	organizationId,
	query,
	logger,
}: {
	organizationId: string;
	query: ContactTypes.ContactListQuery;
	logger?: any;
}): Promise<ContactTypes.ContactListResponse> {
	logger?.info("Listing contacts", { ...query });
	try {
		const page = query.page || 1;
		const limit = Math.min(query.limit || 100, 100);
		const offset = (page - 1) * limit;

		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		];

		if (query.status) {
			whereConditions.push(eq(schema.contact.status, query.status));
		}
		if (query.search) {
			whereConditions.push(ilike(schema.contact.email, `%${query.search}%`));
		}
		const totalResult = await db
			.select({ count: count() })
			.from(schema.contact)
			.where(and(...whereConditions));
		const total = totalResult[0]?.count || 0;
		const [
			totalSummaryResult,
			subscribedSummaryResult,
			unsubscribedSummaryResult,
		] = await Promise.all([
			db
				.select({ count: count() })
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.organizationId, organizationId),
						isNull(schema.contact.deletedAt),
					),
				),
			db
				.select({ count: count() })
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.organizationId, organizationId),
						eq(schema.contact.status, "subscribed"),
						isNull(schema.contact.deletedAt),
					),
				),
			db
				.select({ count: count() })
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.organizationId, organizationId),
						eq(schema.contact.status, "unsubscribed"),
						isNull(schema.contact.deletedAt),
					),
				),
		]);

		const totalContacts = totalSummaryResult[0]?.count || 0;
		const subscribedContacts = subscribedSummaryResult[0]?.count || 0;
		const unsubscribedContacts = unsubscribedSummaryResult[0]?.count || 0;

		const contacts = await db.query.contact.findMany({
			where: and(...whereConditions),
			orderBy: desc(schema.contact.createdAt),
			limit,
			offset,
		});
		const contactIds = contacts.map((c) => c.id);

		// Batch load properties
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
					const contactId = curr.contactId;
					if (!acc[contactId]) {
						acc[contactId] = {};
					}
					const contactProps = acc[contactId];
					if (contactProps) {
						contactProps[curr.name] = curr.value;
					}
					return acc;
				},
				{} as Record<string, Record<string, string>>,
			);
		}

		// Batch load channels and enrollments for all contacts in the list
		const allOrgChannels = await db.query.channel.findMany({
			where: and(
				eq(schema.channel.organizationId, organizationId),
				isNull(schema.channel.deletedAt),
			),
		});

		let enrollmentMap: Record<
			string,
			Record<string, "enrolled" | "unenrolled">
		> = {};
		if (contactIds.length > 0) {
			const allEnrollments = await db.query.channelSubscription.findMany({
				where: and(
					inArray(schema.channelSubscription.contactId, contactIds),
					isNull(schema.channelSubscription.deletedAt),
				),
			});

			enrollmentMap = allEnrollments.reduce(
				(acc, curr) => {
					const contactId = curr.contactId;
					if (!acc[contactId]) {
						acc[contactId] = {};
					}
					const contactEnrollments = acc[contactId];
					if (contactEnrollments) {
						contactEnrollments[curr.channelId] = curr.status;
					}
					return acc;
				},
				{} as Record<string, Record<string, "enrolled" | "unenrolled">>,
			);
		}

		const formattedContacts = contacts.map((contact) => ({
			object: "contact" as const,
			id: contact.id,
			email: contact.email,
			firstName: contact.firstName,
			lastName: contact.lastName,
			status: contact.status,
			properties: propertyMap[contact.id] || {},
			groups: (contact as ContactTypes.ContactData).groups ?? [],
			channels: allOrgChannels.map((t) => {
				const explicitStatus = enrollmentMap[contact.id]?.[t.id];
				return {
					id: t.id,
					name: t.name,
					subscription: (explicitStatus
						? explicitStatus === "enrolled"
							? "opt_in"
							: "opt_out"
						: t.defaultSubscription) as "opt_in" | "opt_out",
				};
			}),
			// Suppression is on the contact row itself — no extra query
			suppressionReason: contact.suppressionReason ?? null,
			suppressedAt: contact.suppressedAt ?? null,
			createdAt: contact.createdAt,
			updatedAt: contact.updatedAt,
		}));
		logger?.info("Contacts listed successfully", { total, page, limit });
		return {
			object: "contact",
			contacts: formattedContacts,
			total,
			page,
			limit,
			totalContacts,
			subscribedContacts,
			unsubscribedContacts,
			event: CONTACT_LIST_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error({
			message: "Error listing contacts",
			query,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
