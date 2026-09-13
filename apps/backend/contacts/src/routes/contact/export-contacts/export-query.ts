import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, exists, ilike, isNull, type SQL, sql } from "drizzle-orm";

export const EXPORT_BATCH_SIZE = 1000;
export const MAX_EXPORT_ROWS = 200_000;
/** Redis single-flight lock TTL for a running export (seconds). */
export const EXPORT_LOCK_TTL_SECONDS = 120;
/** Download link + emailed file validity (7 days, per product decision). */
export const EXPORT_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const EXPORT_CSV_HEADER =
	"Email,First Name,Last Name,Status,Created At,Updated At\n";

export function csvEscape(value: unknown): string {
	const str = value === null || value === undefined ? "" : String(value);
	if (/[",\n\r]/.test(str)) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return `"${str}"`;
}

export function toCsvLine(contact: {
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: string;
	createdAt: Date;
	updatedAt: Date;
}): string {
	return [
		csvEscape(contact.email),
		csvEscape(contact.firstName ?? ""),
		csvEscape(contact.lastName ?? ""),
		csvEscape(contact.status),
		csvEscape(contact.createdAt.toISOString()),
		csvEscape(contact.updatedAt.toISOString()),
	].join(",");
}

export function buildExportConditions(
	organizationId: string,
	query: ContactTypes.ContactExportQuery,
): Array<SQL<unknown>> {
	const conditions: Array<SQL<unknown>> = [
		eq(schema.contact.organizationId, organizationId),
		isNull(schema.contact.deletedAt),
	];

	if (query.status) {
		conditions.push(eq(schema.contact.status, query.status));
	}

	if (query.search) {
		const escaped = query.search.replace(/[%_\\]/g, "\\$&");
		conditions.push(ilike(schema.contact.email, `%${escaped}%`));
	}

	if (query.channelId) {
		conditions.push(
			exists(
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
			),
		);
	}

	if (query.groupId) {
		conditions.push(
			exists(
				db
					.select({ id: schema.contactGroup.id })
					.from(schema.contactGroup)
					.where(
						and(
							eq(schema.contactGroup.contactId, schema.contact.id),
							eq(schema.contactGroup.groupId, query.groupId),
							eq(schema.contactGroup.organizationId, organizationId),
							isNull(schema.contactGroup.deletedAt),
						),
					),
			),
		);
	}

	return conditions;
}

export async function countExportRows(
	organizationId: string,
	query: ContactTypes.ContactExportQuery,
): Promise<number> {
	const conditions = buildExportConditions(organizationId, query);
	const result = await db
		.select({ total: sql<number>`count(*)` })
		.from(schema.contact)
		.where(and(...conditions));
	return Number(result[0]?.total ?? 0);
}
