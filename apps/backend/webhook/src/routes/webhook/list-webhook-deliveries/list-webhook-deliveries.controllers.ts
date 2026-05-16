import { log } from "evlog";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import { and, count, desc, eq } from "drizzle-orm";
import type { WebhookTypes } from "../webhook.type";

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

	log.info({ ...({ webhookId, organizationId, page, limit, status }), message: "Listing webhook deliveries" });

	try {
		// 1. Verify webhook belongs to organization
		const webhook = await db.query.webhook.findFirst({
			where: (webhooks, { and, eq }) =>
				and(
					eq(webhooks.id, webhookId),
					eq(webhooks.organizationId, organizationId),
				),
		});

		if (!webhook) {
			log.error({ ...({ webhookId, organizationId }), message: "Webhook not found or unauthorized" });
			throw new Error("Webhook not found");
		}

		// 2. Fetch deliveries
		const whereClause = and(
			eq(schema.webhookDelivery.webhookId, webhookId),
			status ? eq(schema.webhookDelivery.status, status) : undefined,
		);

		const [totalResult] = await db
			.select({ value: count() })
			.from(schema.webhookDelivery)
			.where(whereClause);

		const deliveries = await db.query.webhookDelivery.findMany({
			where: (d, { and, eq }) =>
				and(
					eq(d.webhookId, webhookId),
					status ? eq(d.status, status) : undefined,
				),
			limit,
			offset,
			orderBy: [desc(schema.webhookDelivery.createdAt)],
		});

		return {
			deliveries: deliveries.map((d) => ({
				id: d.id,
				webhookId: d.webhookId,
				webhookEventId: d.webhookEventId,
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
			})),
			total: totalResult?.value || 0,
			page,
			limit,
		};
	} catch (error) {
		log.error({ ...({ webhookId, organizationId, error }), message: "Error listing webhook deliveries" });
		throw error;
	}
}
