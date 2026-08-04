import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, gte, isNull, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

function utcDayKey(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function buildDayKeys(days: number): string[] {
	const keys: string[] = [];
	const now = new Date();
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(
			Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
		);
		keys.push(utcDayKey(d));
	}
	return keys;
}

export async function subscriptionActivityController({
	organizationId,
	days = 7,
}: {
	organizationId: string;
	days?: number;
}): Promise<{
	object: "contact_subscription_activity";
	days: number;
	dates: string[];
	subscribed: number[];
	unsubscribed: number[];
	event: string;
}> {
	const log = useLogger();
	const rangeDays = Math.min(Math.max(days, 1), 30);
	const dayKeys = buildDayKeys(rangeDays);

	const start = new Date(`${dayKeys[0]}T00:00:00.000Z`);

	log.info("Fetching contact subscription activity", {
		organizationId,
		days: rangeDays,
		start: start.toISOString(),
	});

	try {
		const [subscribedRows, unsubscribedRows] = await Promise.all([
			// New contacts created each day that are currently subscribed
			db
				.select({
					day: sql<string>`to_char(date_trunc('day', ${schema.contact.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
					count: sql<number>`count(*)::int`,
				})
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.organizationId, organizationId),
						isNull(schema.contact.deletedAt),
						eq(schema.contact.status, "subscribed"),
						gte(schema.contact.createdAt, start),
					),
				)
				.groupBy(
					sql`date_trunc('day', ${schema.contact.createdAt} AT TIME ZONE 'UTC')`,
				),
			// Contacts currently unsubscribed last updated that day (proxy for unsubscribe day)
			db
				.select({
					day: sql<string>`to_char(date_trunc('day', ${schema.contact.updatedAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
					count: sql<number>`count(*)::int`,
				})
				.from(schema.contact)
				.where(
					and(
						eq(schema.contact.organizationId, organizationId),
						isNull(schema.contact.deletedAt),
						eq(schema.contact.status, "unsubscribed"),
						gte(schema.contact.updatedAt, start),
					),
				)
				.groupBy(
					sql`date_trunc('day', ${schema.contact.updatedAt} AT TIME ZONE 'UTC')`,
				),
		]);

		const subscribedMap = new Map(
			subscribedRows.map((r) => [r.day, Number(r.count) || 0]),
		);
		const unsubscribedMap = new Map(
			unsubscribedRows.map((r) => [r.day, Number(r.count) || 0]),
		);

		const subscribed = dayKeys.map((key) => subscribedMap.get(key) ?? 0);
		const unsubscribed = dayKeys.map((key) => unsubscribedMap.get(key) ?? 0);

		return {
			object: "contact_subscription_activity",
			days: rangeDays,
			dates: dayKeys,
			subscribed,
			unsubscribed,
			event: "contact.subscription_activity",
		};
	} catch (error) {
		log.error("Failed to fetch contact subscription activity", {
			error: error instanceof Error ? error.message : String(error),
		});
		if (isAppError(error)) throw error;
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
