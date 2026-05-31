import { db } from "@reloop/db/client";
import { domain, emailLog } from "@reloop/db/schema";
import type { LogsModel } from "@reloop/logs/model/logs.model";
import { and, eq, gte, lte, or, sql } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function getEmailStatsController({
	query,
	organizationId,
}: {
	query: LogsModel.EmailStatsQuery;
	organizationId: string;
}): Promise<LogsModel.EmailStatsResponse> {
	const log = useLogger();
	const { start_date, end_date, domain_id, interval = "day" } = query;

	log.info("Getting email stats", { query, organizationId });
	try {
		const conditions = [eq(emailLog.organizationId, organizationId)];

		if (domain_id && domain_id !== "all") {
			const domainRecord = await db.query.domain.findFirst({
				where: and(
					or(eq(domain.id, domain_id), eq(domain.domain, domain_id)),
					eq(domain.organizationId, organizationId),
				),
			});
			if (domainRecord) {
				conditions.push(eq(emailLog.domainId, domainRecord.id));
			} else {
				conditions.push(eq(emailLog.domainId, "non-existent-domain-id"));
			}
		}

		if (start_date) {
			conditions.push(gte(emailLog.createdAt, new Date(start_date)));
		}

		if (end_date) {
			conditions.push(lte(emailLog.createdAt, new Date(end_date)));
		}

		const whereClause = and(...conditions);

		// Group by date/hour
		const dateTrunc = interval === "hour" ? "hour" : "day";
		const groupBySql = sql`date_trunc(${sql.raw(`'${dateTrunc}'`)}, ${emailLog.createdAt})`;

		// We need to count different statuses
		// Delivered, Bounced, Spam (Complaints)
		const stats = await db
			.select({
				date: groupBySql,
				sent: sql<number>`count(*) filter (where ${emailLog.status} != 'pending')`,
				delivered: sql<number>`count(*) filter (where ${emailLog.status} = 'delivered')`,
				bounced: sql<number>`count(*) filter (where ${emailLog.status} = 'bounced')`,
				spam: sql<number>`count(*) filter (where ${emailLog.status} = 'spam')`,
				permanent: sql<number>`count(*) filter (where ${emailLog.status} = 'bounced' and ${emailLog.errorMessage} ilike '%PermanentFailure%')`,
				transient: sql<number>`count(*) filter (where ${emailLog.status} = 'bounced' and ${emailLog.errorMessage} ilike '%TransientFailure%')`,
				undetermined: sql<number>`count(*) filter (where ${emailLog.status} = 'bounced' and ${emailLog.errorMessage} not ilike '%PermanentFailure%' and ${emailLog.errorMessage} not ilike '%TransientFailure%')`,
			})
			.from(emailLog)
			.where(whereClause)
			.groupBy(groupBySql)
			.orderBy(groupBySql);

		const result: LogsModel.EmailStatsResponse = {
			dates: [],
			sent: [],
			delivered: [],
			bounced: [],
			complaint: [],
			rate: [],
			bounceBreakdown: {
				transient: [],
				permanent: [],
				undetermined: [],
			},
		};

		for (const row of stats) {
			if (!row.date) continue;
			const dateStr = new Date(row.date as string | Date).toISOString();
			result.dates.push(dateStr);

			const sentCount = Number(row.sent);
			const deliveredCount = Number(row.delivered);
			const bouncedCount = Number(row.bounced);
			const spamCount = Number(row.spam);
			const permanentCount = Number(row.permanent);
			const transientCount = Number(row.transient);
			const undeterminedCount = Number(row.undetermined);

			result.sent.push(sentCount);
			result.delivered.push(deliveredCount);
			result.bounced.push(bouncedCount);
			result.complaint.push(spamCount);
			result.bounceBreakdown.permanent.push(permanentCount);
			result.bounceBreakdown.transient.push(transientCount);
			result.bounceBreakdown.undetermined.push(undeterminedCount);

			const rate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
			result.rate.push(Math.round(rate * 100) / 100);
		}

		log.info("Email stats retrieved successfully", {
			dataPoints: result.dates.length,
		});
		return result;
	} catch (error) {
		log.error("Error getting email stats", {
			query,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
