import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import {
	and,
	desc,
	eq,
	ilike,
	inArray,
	isNull,
	type SQL,
	sql,
} from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function listContactsController({
	organizationId,
	query,
}: {
	organizationId: string;
	query: ContactTypes.ContactListQuery;
}): Promise<ContactTypes.ContactListResponse> {
	const log = useLogger();
	log.info("Listing contacts", {
		...query,
		status: undefined,
		currentStatus: query.status,
	});
	try {
		const page = query.page || 1;
		const limit = Math.min(query.limit || 100, 100);
		const offset = (page - 1) * limit;

		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		];

		const matchFilters: Array<SQL<unknown>> = [];
		if (query.status) {
			const condition = eq(schema.contact.status, query.status);
			whereConditions.push(condition);
			matchFilters.push(condition);
		}
		if (query.search) {
			const escapedSearch = query.search.replace(/[%_\\]/g, "\\$&");
			const condition = ilike(schema.contact.email, `%${escapedSearch}%`);
			whereConditions.push(condition);
			matchFilters.push(condition);
		}

		const totalMatchingSql =
			matchFilters.length > 0
				? sql<number>`count(*) filter (where ${and(...matchFilters)})`
				: sql<number>`count(*)`;

		// Run the counts aggregation and the paginated contacts fetch in parallel —
		// they are completely independent of each other.
		const [countsResult, contacts] = await Promise.all([
			db
				.select({
					totalMatching: totalMatchingSql,
					totalContacts: sql<number>`count(*)`,
					subscribed: sql<number>`count(*) filter (where ${schema.contact.status} = 'subscribed')`,
					unsubscribed: sql<number>`count(*) filter (where ${schema.contact.status} = 'unsubscribed')`,
				})
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.organizationId, organizationId),
						isNull(schema.contact.deletedAt),
					),
				),
			db.query.contact.findMany({
				where: and(...whereConditions),
				orderBy: desc(schema.contact.createdAt),
				limit,
				offset,
			}),
		]);

		const counts = countsResult[0];
		const total = Number(counts?.totalMatching || 0);
		const totalContacts = Number(counts?.totalContacts || 0);
		const subscribedContacts = Number(counts?.subscribed || 0);
		const unsubscribedContacts = Number(counts?.unsubscribed || 0);

		const contactIds = contacts.map((c) => c.id);

		// Batch-load all related data in parallel; skip entirely when the page is empty.
		let propertyMap: Record<string, Record<string, string>> = {};
		let allOrgChannels: {
			id: string;
			name: string;
			defaultSubscription: string;
		}[] = [];
		let enrollmentMap: Record<
			string,
			Record<string, "enrolled" | "unenrolled">
		> = {};

		if (contactIds.length > 0) {
			const [allProperties, channelRows, allEnrollments] = await Promise.all([
				// Batch load all property values for this page of contacts
				db
					.select({
						contactId: schema.contactPropertyValue.contactId,
						name: schema.contactProperty.propertyName,
						value: schema.contactPropertyValue.value,
					})
					.from(schema.contactPropertyValue)
					.innerJoin(
						schema.contactProperty,
						eq(
							schema.contactPropertyValue.propertyId,
							schema.contactProperty.id,
						),
					)
					.where(inArray(schema.contactPropertyValue.contactId, contactIds)),

				// Lean select — only the three columns actually used in the response mapping
				db
					.select({
						id: schema.channel.id,
						name: schema.channel.name,
						defaultSubscription: schema.channel.defaultSubscription,
					})
					.from(schema.channel)
					.where(
						and(
							eq(schema.channel.organizationId, organizationId),
							isNull(schema.channel.deletedAt),
						),
					),

				// Batch load all channel enrollments for this page of contacts
				db.query.channelSubscription.findMany({
					where: and(
						inArray(schema.channelSubscription.contactId, contactIds),
						isNull(schema.channelSubscription.deletedAt),
					),
				}),
			]);

			allOrgChannels = channelRows;

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
		log.info("Contacts listed successfully", { total, page, limit });
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
		log.error("Error listing contacts", {
			query,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
