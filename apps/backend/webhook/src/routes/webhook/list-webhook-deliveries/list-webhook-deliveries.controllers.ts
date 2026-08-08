import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { log } from "evlog";
import type { WebhookTypes } from "../webhook.type";

type AttemptRow = {
	id: string;
	attemptNumber: number;
	status: "pending" | "success" | "failed" | "retrying";
	responseStatus: number | null;
	responseBody: string | null;
	responseHeaders: Record<string, string> | null;
	durationMs: number | null;
	errorMessage: string | null;
	createdAt: Date;
};

function mapAttempt(
	a: AttemptRow,
	source: "automatic" | "manual",
	retriedAutomatically: boolean,
): WebhookTypes.WebhookDeliveryResponse["attempts"][number] {
	return {
		id: a.id,
		attemptNumber: a.attemptNumber,
		status: a.status,
		responseStatus: a.responseStatus,
		responseBody: a.responseBody,
		responseHeaders: a.responseHeaders,
		durationMs: a.durationMs,
		errorMessage: a.errorMessage,
		createdAt: a.createdAt.toISOString(),
		source,
		retriedAutomatically,
	};
}

/**
 * List root deliveries only (excludes manual resend/replay rows).
 * Attempts from the worker + nested manual resends are folded into `attempts`.
 */
export async function listWebhookDeliveriesController({
	webhookId,
	organizationId,
	query,
}: {
	webhookId: string;
	organizationId: string;
	query: WebhookTypes.WebhookDeliveryQuery;
}): Promise<WebhookTypes.WebhookDeliveryListResponse> {
	const { page = 1, limit = 10, status } = query;
	const offset = (page - 1) * limit;

	log.info({
		...{ webhookId, organizationId, page, limit, status },
		message: "Listing webhook deliveries",
	});

	try {
		const webhook = await db.query.webhook.findFirst({
			where: (webhooks, { and, eq }) =>
				and(
					eq(webhooks.id, webhookId),
					eq(webhooks.organizationId, organizationId),
				),
		});

		if (!webhook) {
			log.error({
				...{ webhookId, organizationId },
				message: "Webhook not found or unauthorized",
			});
			throw new Error("Webhook not found");
		}

		// Root deliveries only — manual resends (replayOfDeliveryId set) are nested.
		const rootWhere = and(
			eq(schema.webhookDelivery.webhookId, webhookId),
			isNull(schema.webhookDelivery.replayOfDeliveryId),
			status ? eq(schema.webhookDelivery.status, status) : undefined,
		);

		const [totalResult] = await db
			.select({ value: count() })
			.from(schema.webhookDelivery)
			.where(rootWhere);

		const deliveries = await db.query.webhookDelivery.findMany({
			where: rootWhere,
			limit,
			offset,
			orderBy: [desc(schema.webhookDelivery.createdAt)],
			with: {
				attempts: {
					orderBy: [desc(schema.webhookDeliveryAttempt.createdAt)],
				},
			},
		});

		const rootIds = deliveries.map((d) => d.id);

		// Manual resends that should appear under the original event, not as list rows.
		const replays =
			rootIds.length === 0
				? []
				: await db.query.webhookDelivery.findMany({
						where: and(
							eq(schema.webhookDelivery.webhookId, webhookId),
							inArray(schema.webhookDelivery.replayOfDeliveryId, rootIds),
						),
						orderBy: [desc(schema.webhookDelivery.createdAt)],
						with: {
							attempts: {
								orderBy: [desc(schema.webhookDeliveryAttempt.createdAt)],
							},
						},
					});

		const replaysByRoot = new Map<string, typeof replays>();
		for (const r of replays) {
			const parentId = r.replayOfDeliveryId;
			if (!parentId) continue;
			const list = replaysByRoot.get(parentId) ?? [];
			list.push(r);
			replaysByRoot.set(parentId, list);
		}

		return {
			deliveries: deliveries.map((d) => {
				const automaticMapped = d.attempts.map((a) =>
					mapAttempt(a, "automatic", a.attemptNumber > 1),
				);

				const manualAttempts: WebhookTypes.WebhookDeliveryResponse["attempts"] =
					[];
				const childReplays = replaysByRoot.get(d.id) ?? [];
				for (const replay of childReplays) {
					if (replay.attempts.length === 0) {
						// Resend enqueued but not attempted yet — surface as pending row
						manualAttempts.push({
							id: `${replay.id}:pending`,
							attemptNumber: 0,
							status: replay.status === "pending" ? "pending" : replay.status,
							responseStatus: replay.responseStatus,
							responseBody: replay.responseBody,
							responseHeaders: replay.responseHeaders,
							durationMs: replay.durationMs,
							errorMessage: replay.errorMessage,
							createdAt: replay.createdAt.toISOString(),
							source: "manual",
							retriedAutomatically: false,
						});
					} else {
						for (const a of replay.attempts) {
							manualAttempts.push(mapAttempt(a, "manual", false));
						}
					}
				}

				// Fallback: older deliveries may lack attempt rows
				let attempts =
					automaticMapped.length > 0 || manualAttempts.length > 0
						? [...manualAttempts, ...automaticMapped]
						: d.attemptNumber > 0 || d.responseStatus != null
							? [
									{
										id: `${d.id}:synthetic`,
										attemptNumber: d.attemptNumber || 1,
										status: d.status,
										responseStatus: d.responseStatus,
										responseBody: d.responseBody,
										responseHeaders: d.responseHeaders,
										durationMs: d.durationMs,
										errorMessage: d.errorMessage,
										createdAt: (d.lastAttemptAt ?? d.createdAt).toISOString(),
										source: "automatic" as const,
										retriedAutomatically: false,
									},
								]
							: [];

				// Newest first
				attempts = attempts.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				);

				return {
					id: d.id,
					webhookId: d.webhookId,
					webhookEventId: d.webhookEventId,
					replayOfDeliveryId: d.replayOfDeliveryId ?? null,
					eventType: d.eventType,
					eventData: d.eventData,
					status: d.status,
					requestUrl: d.requestUrl,
					requestHeaders: d.requestHeaders,
					requestBody: d.requestBody,
					responseStatus: d.responseStatus,
					responseBody: d.responseBody,
					responseHeaders: d.responseHeaders,
					attemptNumber: d.attemptNumber,
					maxAttempts: d.maxAttempts,
					nextRetryAt: d.nextRetryAt?.toISOString() || null,
					lastAttemptAt: d.lastAttemptAt?.toISOString() || null,
					errorMessage: d.errorMessage,
					errorDetails: d.errorDetails,
					completedAt: d.completedAt?.toISOString() || null,
					durationMs: d.durationMs,
					createdAt: d.createdAt.toISOString(),
					attempts,
				};
			}),
			total: totalResult?.value || 0,
			page,
			limit,
		};
	} catch (error) {
		log.error({
			...{ webhookId, organizationId, error },
			message: "Error listing webhook deliveries",
		});
		throw error;
	}
}
