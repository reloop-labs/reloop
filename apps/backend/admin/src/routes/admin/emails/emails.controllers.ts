import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

export async function listEmailsController({
	limit = 50,
	offset = 0,
	q,
	status,
	organizationId,
}: {
	limit?: number;
	offset?: number;
	q?: string;
	status?: string;
	organizationId?: string;
}) {
	const conditions = [];
	if (organizationId) {
		conditions.push(eq(emailLog.organizationId, organizationId));
	}
	if (status) {
		conditions.push(
			eq(
				emailLog.status,
				status as
					| "pending"
					| "sent"
					| "delivered"
					| "failed"
					| "bounced"
					| "spam"
					| "archived",
			),
		);
	}
	if (q) {
		conditions.push(
			or(
				ilike(emailLog.fromEmail, `%${q}%`),
				ilike(emailLog.subject, `%${q}%`),
				sql`cast(${emailLog.toEmails} as text) ilike ${`%${q}%`}`,
			)!,
		);
	}
	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [totalRow] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(whereClause);

	const items = await db
		.select({
			id: emailLog.id,
			organizationId: emailLog.organizationId,
			fromEmail: emailLog.fromEmail,
			toEmails: emailLog.toEmails,
			subject: emailLog.subject,
			status: emailLog.status,
			createdAt: emailLog.createdAt,
			sentAt: emailLog.sentAt,
		})
		.from(emailLog)
		.where(whereClause)
		.orderBy(desc(emailLog.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		items,
		total: totalRow?.value ?? 0,
	};
}
