import { AutomationErrors } from "@be/workflow/error/automation.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, eq, gte, isNotNull, isNull, sql } from "drizzle-orm";

const RUN_STATUSES = ["active", "completed", "cancelled", "failed"] as const;
const STEP_STATUSES = [
	"pending",
	"running",
	"completed",
	"skipped",
	"failed",
] as const;
const EMAIL_EVENTS = ["delivered", "opened", "clicked", "bounced"] as const;

type RunStatus = (typeof RUN_STATUSES)[number];
type StepStatus = (typeof STEP_STATUSES)[number];
type EmailCounts = Record<"sent" | (typeof EMAIL_EVENTS)[number], number>;

const emptyRuns = () => ({
	total: 0,
	active: 0,
	completed: 0,
	cancelled: 0,
	failed: 0,
});
const emptyEmails = (): EmailCounts => ({
	sent: 0,
	delivered: 0,
	opened: 0,
	clicked: 0,
	bounced: 0,
});

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getMetricsController(params: {
	organizationId: string;
	automationId: string;
	days: number;
}) {
	const automation = await db.query.automation.findFirst({
		where: and(
			eq(schema.automation.id, params.automationId),
			eq(schema.automation.organizationId, params.organizationId),
			isNull(schema.automation.deletedAt),
		),
		columns: { id: true },
	});
	if (!automation) throw AutomationErrors.notFound(params.automationId);

	const enrollment = schema.automationEnrollment;
	const stepRun = schema.automationStepRun;
	const ofAutomation = and(
		eq(enrollment.organizationId, params.organizationId),
		eq(enrollment.automationId, params.automationId),
	);

	// Midnight UTC `days - 1` days ago, so today counts as one of the days.
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	const since = new Date(today.getTime() - (params.days - 1) * DAY_MS);
	const day = sql<string>`to_char(date_trunc('day', ${enrollment.enrolledAt}), 'YYYY-MM-DD')`;

	const sentDay = sql<string>`to_char(date_trunc('day', ${stepRun.finishedAt}), 'YYYY-MM-DD')`;
	const eventDay = sql<string>`to_char(date_trunc('day', ${schema.emailEvent.createdAt}), 'YYYY-MM-DD')`;

	const [
		byStatus,
		duration,
		bySteps,
		emailsByStep,
		sentByStep,
		byDay,
		sentByDay,
		eventsByDay,
	] = await Promise.all([
		db
			.select({ status: enrollment.status, total: count() })
			.from(enrollment)
			.where(ofAutomation)
			.groupBy(enrollment.status),
		db
			.select({
				ms: sql<
					string | null
				>`avg(extract(epoch from (${enrollment.completedAt} - ${enrollment.enrolledAt})) * 1000)`,
			})
			.from(enrollment)
			.where(and(ofAutomation, eq(enrollment.status, "completed"))),
		db
			.select({
				nodeId: stepRun.nodeId,
				nodeType: stepRun.nodeType,
				status: stepRun.status,
				total: count(),
			})
			.from(stepRun)
			.innerJoin(enrollment, eq(stepRun.enrollmentId, enrollment.id))
			.where(ofAutomation)
			.groupBy(stepRun.nodeId, stepRun.nodeType, stepRun.status),
		db
			.select({
				nodeId: stepRun.nodeId,
				type: schema.emailEvent.type,
				total: sql<number>`count(distinct ${schema.emailEvent.emailLogId})`,
			})
			.from(stepRun)
			.innerJoin(enrollment, eq(stepRun.enrollmentId, enrollment.id))
			.innerJoin(
				schema.emailEvent,
				eq(schema.emailEvent.emailLogId, stepRun.emailLogId),
			)
			.where(ofAutomation)
			.groupBy(stepRun.nodeId, schema.emailEvent.type),
		db
			.select({ nodeId: stepRun.nodeId, total: count() })
			.from(stepRun)
			.innerJoin(enrollment, eq(stepRun.enrollmentId, enrollment.id))
			.where(and(ofAutomation, isNotNull(stepRun.emailLogId)))
			.groupBy(stepRun.nodeId),
		db
			.select({ date: day, status: enrollment.status, total: count() })
			.from(enrollment)
			.where(and(ofAutomation, gte(enrollment.enrolledAt, since)))
			.groupBy(day, enrollment.status),
		db
			.select({ date: sentDay, total: count() })
			.from(stepRun)
			.innerJoin(enrollment, eq(stepRun.enrollmentId, enrollment.id))
			.where(
				and(
					ofAutomation,
					isNotNull(stepRun.emailLogId),
					gte(stepRun.finishedAt, since),
				),
			)
			.groupBy(sentDay),
		db
			.select({
				date: eventDay,
				type: schema.emailEvent.type,
				total: sql<number>`count(distinct ${schema.emailEvent.emailLogId})`,
			})
			.from(stepRun)
			.innerJoin(enrollment, eq(stepRun.enrollmentId, enrollment.id))
			.innerJoin(
				schema.emailEvent,
				eq(schema.emailEvent.emailLogId, stepRun.emailLogId),
			)
			.where(and(ofAutomation, gte(schema.emailEvent.createdAt, since)))
			.groupBy(eventDay, schema.emailEvent.type),
	]);

	const runs = emptyRuns();
	for (const row of byStatus) {
		runs[row.status as RunStatus] = Number(row.total);
		runs.total += Number(row.total);
	}

	const steps = new Map<
		string,
		{ nodeId: string; nodeType: string; emails: EmailCounts } & Record<
			StepStatus,
			number
		>
	>();
	const stepFor = (nodeId: string, nodeType = "") => {
		let entry = steps.get(nodeId);
		if (!entry) {
			entry = {
				nodeId,
				nodeType,
				pending: 0,
				running: 0,
				completed: 0,
				skipped: 0,
				failed: 0,
				emails: emptyEmails(),
			};
			steps.set(nodeId, entry);
		}
		if (!entry.nodeType && nodeType) entry.nodeType = nodeType;
		return entry;
	};
	for (const row of bySteps) {
		stepFor(row.nodeId, row.nodeType)[row.status as StepStatus] = Number(
			row.total,
		);
	}

	const emails = emptyEmails();
	for (const row of sentByStep) {
		stepFor(row.nodeId).emails.sent = Number(row.total);
		emails.sent += Number(row.total);
	}
	for (const row of emailsByStep) {
		const type = row.type as (typeof EMAIL_EVENTS)[number];
		if (!EMAIL_EVENTS.includes(type)) continue;
		stepFor(row.nodeId).emails[type] = Number(row.total);
		emails[type] += Number(row.total);
	}

	// Every day in the range, including days with no runs.
	const daily = new Map<
		string,
		ReturnType<typeof emptyRuns> & { emails: EmailCounts }
	>();
	for (let i = 0; i < params.days; i++) {
		const date = new Date(since.getTime() + i * DAY_MS)
			.toISOString()
			.slice(0, 10);
		daily.set(date, { ...emptyRuns(), emails: emptyEmails() });
	}
	for (const row of byDay) {
		const entry = daily.get(row.date);
		if (!entry) continue;
		entry[row.status as RunStatus] = Number(row.total);
		entry.total += Number(row.total);
	}
	for (const row of sentByDay) {
		const entry = daily.get(row.date);
		if (entry) entry.emails.sent = Number(row.total);
	}
	for (const row of eventsByDay) {
		const type = row.type as (typeof EMAIL_EVENTS)[number];
		const entry = daily.get(row.date);
		if (entry && EMAIL_EVENTS.includes(type)) {
			entry.emails[type] = Number(row.total);
		}
	}

	const averageMs = duration[0]?.ms;
	return {
		runs: {
			...runs,
			averageDurationMs:
				averageMs == null ? null : Math.round(Number(averageMs)),
		},
		emails,
		steps: [...steps.values()],
		daily: [...daily.entries()].map(([date, counts]) => ({ date, ...counts })),
	};
}
