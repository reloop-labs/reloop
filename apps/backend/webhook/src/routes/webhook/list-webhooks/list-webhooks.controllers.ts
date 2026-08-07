import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { WebhookEventName } from "@reloop/webhook-events";
import { and, count, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { log } from "evlog";
import type { WebhookTypes } from "../webhook.type";

const HEALTH_DAYS = 7;

/** UTC calendar day key YYYY-MM-DD */
function dayKey(d: Date): string {
	return d.toISOString().slice(0, 10);
}

/** Last N calendar days as YYYY-MM-DD keys, oldest → newest (UTC). */
function lastNDayKeys(n: number, now = new Date()): string[] {
	const keys: string[] = [];
	// Start of today UTC, then walk back n-1 days
	const todayUtc = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
	for (let i = n - 1; i >= 0; i--) {
		const day = new Date(todayUtc);
		day.setUTCDate(todayUtc.getUTCDate() - i);
		keys.push(dayKey(day));
	}
	return keys;
}

type DayBucket = { success: number; failure: number };

/**
 * Build per-webhook 7-day health series from delivery rows.
 * Series values = successful deliveries that day (oldest → newest).
 */
async function loadHealthByWebhook(
	webhookIds: string[],
): Promise<
	Map<
		string,
		{ series: number[]; successCount7d: number; failureCount7d: number }
	>
> {
	const empty = new Map<
		string,
		{ series: number[]; successCount7d: number; failureCount7d: number }
	>();
	if (webhookIds.length === 0) return empty;

	const dayKeys = lastNDayKeys(HEALTH_DAYS);
	const since = new Date(`${dayKeys[0]}T00:00:00.000Z`);

	const rows = await db
		.select({
			webhookId: schema.webhookDelivery.webhookId,
			day: sql<string>`to_char(date_trunc('day', ${schema.webhookDelivery.createdAt} AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`,
			successes: sql<number>`count(*) filter (where ${schema.webhookDelivery.status} = 'success')::int`,
			failures: sql<number>`count(*) filter (where ${schema.webhookDelivery.status} = 'failed')::int`,
		})
		.from(schema.webhookDelivery)
		.where(
			and(
				inArray(schema.webhookDelivery.webhookId, webhookIds),
				gte(schema.webhookDelivery.createdAt, since),
			),
		)
		.groupBy(
			schema.webhookDelivery.webhookId,
			sql`date_trunc('day', ${schema.webhookDelivery.createdAt} AT TIME ZONE 'UTC')`,
		);

	const byWebhook = new Map<string, Map<string, DayBucket>>();
	for (const id of webhookIds) {
		byWebhook.set(id, new Map());
	}

	for (const row of rows) {
		const dayMap = byWebhook.get(row.webhookId) ?? new Map();
		dayMap.set(row.day, {
			success: Number(row.successes) || 0,
			failure: Number(row.failures) || 0,
		});
		byWebhook.set(row.webhookId, dayMap);
	}

	const result = new Map<
		string,
		{ series: number[]; successCount7d: number; failureCount7d: number }
	>();

	for (const id of webhookIds) {
		const dayMap = byWebhook.get(id) ?? new Map();
		let successCount7d = 0;
		let failureCount7d = 0;
		const series = dayKeys.map((key) => {
			const bucket = dayMap.get(key);
			const s = bucket?.success ?? 0;
			const f = bucket?.failure ?? 0;
			successCount7d += s;
			failureCount7d += f;
			return s;
		});
		result.set(id, { series, successCount7d, failureCount7d });
	}

	return result;
}

export async function listWebhooksController({
	query,
	organizationId,
}: {
	query: WebhookTypes.WebhookQuery;
	organizationId: string;
}): Promise<WebhookTypes.WebhookListResponse> {
	const { page = 1, limit = 10, status } = query;
	const offset = (page - 1) * limit;

	log.info({ ...{ query, organizationId }, message: "Listing webhooks" });

	try {
		const conditions = [
			isNull(schema.webhook.deletedAt),
			eq(schema.webhook.organizationId, organizationId),
		];

		if (status !== undefined) {
			conditions.push(eq(schema.webhook.status, status));
		}

		const whereClause = and(...conditions);
		const [{ count: total = 0 } = { count: 0 }] = await db
			.select({ count: count() })
			.from(schema.webhook)
			.where(whereClause);

		const webhooks = await db.query.webhook.findMany({
			where: whereClause,
			orderBy: desc(schema.webhook.createdAt),
			limit,
			offset,
			with: {
				subscriptions: {
					where: eq(schema.webhookEventSubscription.isEnabled, true),
				},
				user: true,
			},
		});

		const healthById = await loadHealthByWebhook(webhooks.map((w) => w.id));

		return {
			webhooks: webhooks.map((webhook) => {
				const health = healthById.get(webhook.id);
				return {
					id: webhook.id,
					name: webhook.name,
					url: webhook.url,
					secret: "whsec_••••••••",
					status: webhook.status,
					customHeaders: webhook.customHeaders,
					rateLimitEnabled: webhook.rateLimitEnabled,
					maxRequestsPerMinute: webhook.maxRequestsPerMinute,
					maxRetries: webhook.maxRetries,
					retryBackoffMultiplier: webhook.retryBackoffMultiplier,
					filteringOptions: webhook.filteringOptions,
					lastTriggeredAt: webhook.lastTriggeredAt?.toISOString() || null,
					successCount: webhook.successCount,
					failureCount: webhook.failureCount,
					consecutiveFailures: webhook.consecutiveFailures,
					healthSeries: health?.series ?? Array(HEALTH_DAYS).fill(0),
					healthSuccessCount7d: health?.successCount7d ?? 0,
					healthFailureCount7d: health?.failureCount7d ?? 0,
					events: webhook.subscriptions.map(
						(s) => s.eventId as WebhookEventName,
					),
					createdBy: webhook.user
						? {
								id: webhook.user.id,
								name: webhook.user.name,
								email: webhook.user.email,
								image: webhook.user.image,
							}
						: undefined,
					createdAt: webhook.createdAt.toISOString(),
					updatedAt: webhook.updatedAt.toISOString(),
				};
			}),
			total,
			page,
			limit,
		};
	} catch (error) {
		log.error({
			...{ query, organizationId, error },
			message: "Error listing webhooks",
		});
		throw error;
	}
}
