import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import {
	and,
	count,
	desc,
	eq,
	exists,
	gte,
	ilike,
	lte,
	or,
	type SQL,
	sql,
} from "drizzle-orm";
import { useLogger } from "evlog/elysia";

type EmailStatus = (typeof schema.emailStatusEnum.enumValues)[number];

/**
 * Delivery lifecycle status for the list UI.
 * Open/click live on email_event only — email_log.status stays delivered.
 * Prefer engagement (clicked > opened) over the stored delivery status.
 */
function deriveDisplayStatus(
	status: string,
	eventTypes: Iterable<string>,
): string {
	// Terminal failure states are never overridden by engagement.
	if (status === "failed" || status === "bounced" || status === "spam") {
		return status;
	}
	const types = eventTypes instanceof Set ? eventTypes : new Set(eventTypes);
	if (types.has("clicked")) return "clicked";
	if (types.has("opened")) return "opened";
	return status;
}

function hasEventType(type: "opened" | "clicked"): SQL {
	return exists(
		db
			.select({ id: schema.emailEvent.id })
			.from(schema.emailEvent)
			.where(
				and(
					eq(schema.emailEvent.emailLogId, schema.emailLog.id),
					eq(schema.emailEvent.type, type),
				),
			),
	);
}

export async function listEmailLogsController({
	query,
	organizationId,
}: {
	query: LogsModel.ListEmailLogsQuery;
	organizationId: string;
}): Promise<LogsModel.ListEmailLogsResponse> {
	const log = useLogger();
	const {
		page = 1,
		limit = 10,
		search,
		status,
		domain,
		api_key_id,
		start_date,
		end_date,
		recipient,
	} = query;
	const offset = (page - 1) * limit;

	log.info("Listing email logs", { query, organizationId });
	try {
		const conditions: SQL[] = [
			eq(schema.emailLog.organizationId, organizationId),
		];

		// opened/clicked are event types, not email_log.status enum values.
		if (status === "opened") {
			conditions.push(hasEventType("opened"));
		} else if (status === "clicked") {
			conditions.push(hasEventType("clicked"));
		} else if (status) {
			conditions.push(eq(schema.emailLog.status, status as EmailStatus));
		}

		if (domain) {
			const domainRecord = await db.query.domain.findFirst({
				where: and(
					eq(schema.domain.domain, domain),
					eq(schema.domain.organizationId, organizationId),
				),
			});
			if (domainRecord) {
				conditions.push(eq(schema.emailLog.domainId, domainRecord.id));
			} else {
				conditions.push(eq(schema.emailLog.domainId, "non-existent-domain-id"));
			}
		}

		if (api_key_id) {
			conditions.push(eq(schema.emailLog.apikeyId, api_key_id));
		}

		if (start_date) {
			conditions.push(gte(schema.emailLog.createdAt, new Date(start_date)));
		}

		if (end_date) {
			conditions.push(lte(schema.emailLog.createdAt, new Date(end_date)));
		}

		if (search) {
			conditions.push(
				or(
					ilike(schema.emailLog.subject, `%${search}%`),
					ilike(schema.emailLog.fromEmail, `%${search}%`),
				) as SQL,
			);
		}

		if (recipient) {
			// Postgres jsonb array-contains: to_emails @> '["addr"]'::jsonb
			conditions.push(
				sql`${schema.emailLog.toEmails} @> ${JSON.stringify([recipient])}::jsonb` as SQL,
			);
		}

		const whereClause = and(...conditions);
		if (!whereClause) {
			throw new Error("Where clause is required");
		}

		const totalResult = await db
			.select({ count: count() })
			.from(schema.emailLog)
			.where(whereClause);

		const total = totalResult[0]?.count || 0;

		const logs = await db.query.emailLog.findMany({
			where: whereClause,
			orderBy: desc(schema.emailLog.createdAt),
			limit: limit,
			offset: offset,
			with: {
				events: {
					columns: { type: true },
				},
			},
		});

		log.info("Email logs listed successfully", { count: logs.length, total });
		// Project only the list-entry shape. Spreading the full row can leave
		// Date fields that confuse clients and response validation.
		// Status is the lifecycle display status (opened/clicked when tracked).
		return {
			object: "list",
			data: logs.map((entry) => ({
				id: entry.id,
				subject: entry.subject,
				fromEmail: entry.fromEmail,
				toEmails: (entry.toEmails ?? []) as string[],
				status: deriveDisplayStatus(
					entry.status,
					(entry.events ?? []).map((e) => e.type),
				),
				createdAt: entry.createdAt.toISOString(),
			})),
			total,
			page,
			limit,
		};
	} catch (error) {
		log.error("Error listing email logs", {
			query,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
