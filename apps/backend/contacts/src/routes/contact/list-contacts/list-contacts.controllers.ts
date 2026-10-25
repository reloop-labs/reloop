import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { getSuppressionSource } from "@be/contacts/utils/suppression";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { CONTACT_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import {
	and,
	desc,
	eq,
	exists,
	ilike,
	inArray,
	isNotNull,
	isNull,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";

type ContactStatus = "subscribed" | "unsubscribed" | "blocked";

/** Parse "subscribed,blocked" into a de-duplicated list (the route validates values). */
export function parseStatusFilter(raw: string | undefined): ContactStatus[] {
	if (!raw) return [];
	return [...new Set(raw.split(",").filter(Boolean))] as ContactStatus[];
}

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
		// `suppressed` sorts by suppressedAt, which cursors cannot follow: that
		// mode keeps offset pagination and always returns `nextCursor: null`.
		if (query.cursor && query.suppressed) {
			throw createError({
				status: 400,
				message: "cursor cannot be combined with this sort",
				why: "Contacts filtered with suppressed=true are sorted by suppression time, which cursor pagination does not support.",
				fix: "Remove cursor and paginate with page, or drop suppressed to page by cursor.",
			});
		}
		// With a cursor, pagination is keyset-based and `page` is ignored.
		const position = query.cursor ? decodeCursor(query.cursor) : null;
		const offset = position ? 0 : (page - 1) * limit;

		const whereConditions: Array<SQL<unknown>> = [
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		];

		const matchFilters: Array<SQL<unknown>> = [];
		const statuses = parseStatusFilter(query.status);
		if (statuses.length > 0) {
			const condition = inArray(schema.contact.status, statuses);
			whereConditions.push(condition);
			matchFilters.push(condition);
		}
		if (query.suppressed) {
			// Same definition the mail service enforces at send time
			// (step-2b-check-suppressions): blocked or carrying a suppression reason.
			const condition = or(
				eq(schema.contact.status, "blocked"),
				isNotNull(schema.contact.suppressionReason),
			) as SQL<unknown>;
			whereConditions.push(condition);
			matchFilters.push(condition);
		}
		if (query.search) {
			const escapedSearch = query.search.replace(/[%_\\]/g, "\\$&");
			const condition = ilike(schema.contact.email, `%${escapedSearch}%`);
			whereConditions.push(condition);
			matchFilters.push(condition);
		}
		if (query.channelId) {
			const enrolledInChannel = exists(
				db
					.select({ id: schema.channelSubscription.id })
					.from(schema.channelSubscription)
					.where(
						and(
							eq(schema.channelSubscription.contactId, schema.contact.id),
							eq(schema.channelSubscription.channelId, query.channelId),
							eq(schema.channelSubscription.organizationId, organizationId),
							eq(schema.channelSubscription.status, "enrolled"),
							isNull(schema.channelSubscription.deletedAt),
						),
					),
			);
			// Scope the base audience to enrolled contacts; keep matchFilters for
			// search/status only so totalMatching stays correct on that scoped set.
			whereConditions.push(enrolledInChannel);
		}

		const totalMatchingSql =
			matchFilters.length > 0
				? sql<number>`count(*) filter (where ${and(...matchFilters)})`
				: sql<number>`count(*)`;

		const countsWhere = and(
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
			query.channelId
				? exists(
						db
							.select({ id: schema.channelSubscription.id })
							.from(schema.channelSubscription)
							.where(
								and(
									eq(schema.channelSubscription.contactId, schema.contact.id),
									eq(schema.channelSubscription.channelId, query.channelId),
									eq(schema.channelSubscription.organizationId, organizationId),
									eq(schema.channelSubscription.status, "enrolled"),
									isNull(schema.channelSubscription.deletedAt),
								),
							),
					)
				: undefined,
		);

		const orderBy = query.suppressed
			? [
					sql`${schema.contact.suppressedAt} desc nulls last`,
					desc(schema.contact.updatedAt),
					desc(schema.contact.id),
				]
			: cursorOrderBy(schema.contact);
		if (position) {
			whereConditions.push(afterCursor(schema.contact, position));
		}

		const [countsResult, rows] = await Promise.all([
			db
				.select({
					totalMatching: totalMatchingSql,
					totalContacts: sql<number>`count(*)`,
					subscribed: sql<number>`count(*) filter (where ${schema.contact.status} = 'subscribed')`,
					unsubscribed: sql<number>`count(*) filter (where ${schema.contact.status} = 'unsubscribed')`,
				})
				.from(schema.contact)
				.where(countsWhere),
			db.query.contact.findMany({
				where: and(...whereConditions),
				orderBy,
				limit: limit + 1,
				offset,
			}),
		]);
		const {
			items: contacts,
			hasMore,
			nextCursor: lastRowCursor,
		} = toCursorPage(rows, limit);
		const nextCursor = query.suppressed ? null : lastRowCursor;

		const counts = countsResult[0];
		const total = Number(counts?.totalMatching || 0);
		const totalContacts = Number(counts?.totalContacts || 0);
		const subscribedContacts = Number(counts?.subscribed || 0);
		const unsubscribedContacts = Number(counts?.unsubscribed || 0);

		const contactIds = contacts.map((c) => c.id);

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
			// Only explicit enrollments — do not treat channel defaultSubscription
			// as membership (that made every contact look enrolled in opt-in channels).
			channels: allOrgChannels
				.filter((t) => enrollmentMap[contact.id]?.[t.id] !== undefined)
				.map((t) => {
					const explicitStatus = enrollmentMap[contact.id]?.[t.id];
					return {
						id: t.id,
						name: t.name,
						subscription: (explicitStatus === "enrolled"
							? "opt_in"
							: "opt_out") as "opt_in" | "opt_out",
					};
				}),

			suppressionReason: contact.suppressionReason ?? null,
			suppressedAt: contact.suppressedAt ?? null,
			suppressionSource: getSuppressionSource(contact),
			suppressionNote: contact.suppressionNote ?? null,
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
			hasMore,
			nextCursor,
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
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
