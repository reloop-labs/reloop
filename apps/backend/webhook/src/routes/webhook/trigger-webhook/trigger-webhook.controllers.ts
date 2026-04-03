import { createHmac } from "node:crypto";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { eq, sql } from "drizzle-orm";
import type { WebhookTypes } from "../webhook.type";

export async function triggerWebhookController({
  event,
  payload,
  organizationId,
  userId,
}: WebhookTypes.TriggerWebhookRequest): Promise<WebhookTypes.TriggerWebhookResponse> {
  logger.info({ event, organizationId, userId }, "Triggering webhooks");

  try {
    // 1. Find all active webhooks for this organization/user subscribed to this event
    const webhooks = await db.query.webhook.findMany({
      where: (webhooks, { and, eq, isNull }) =>
        and(
          organizationId
            ? eq(webhooks.organizationId, organizationId)
            : undefined,
          userId ? eq(webhooks.userId, userId) : undefined,
          eq(webhooks.status, "active"),
          isNull(webhooks.deletedAt),
        ),
      with: {
        subscriptions: {
          where: (subs, { and, eq }) =>
            and(eq(subs.eventId, event), eq(subs.isEnabled, true)),
        },
      },
    });

    const subscribedWebhooks = webhooks.filter(
      (w) => w.subscriptions.length > 0,
    );

    if (subscribedWebhooks.length === 0) {
      logger.info(
        { event, organizationId },
        "No webhooks subscribed to this event",
      );
      return {
        success: true,
        message: "No webhooks subscribed to this event",
      };
    }

    // 2. Create the webhook event record
    const [webhookEvent] = await db
      .insert(schema.webhookEvent)
      .values({
        event,
        payload,
        source: "user-api",
        organizationId:
          organizationId || subscribedWebhooks[0]?.organizationId || "",
        userId: userId || null,
      })
      .returning();

    if (!webhookEvent) {
      throw new Error("Failed to create webhook event record");
    }

    // 3. For each webhook, create a delivery record and trigger it
    const deliveryPromises = subscribedWebhooks.map(async (webhook) => {
      const deliveryId = `whde_${createId()}`;

      // Create initial delivery record
      await db.insert(schema.webhookDelivery).values({
        id: deliveryId,
        webhookId: webhook.id,
        webhookEventId: webhookEvent.id,
        eventType: event,
        eventData: payload,
        status: "pending",
        requestUrl: webhook.url,
        attemptNumber: 1,
      });

      // Trigger the webhook asynchronously
      // We don't await this to keep the API response fast
      dispatchWebhook(webhook, webhookEvent, deliveryId).catch((err) => {
        logger.error(
          {
            webhookId: webhook.id,
            deliveryId,
            error: err instanceof Error ? err.message : String(err),
          },
          "Background webhook dispatch failed",
        );
      });
    });

    await Promise.all(deliveryPromises);

    return {
      success: true,
      message: `Event triggered for ${subscribedWebhooks.length} webhooks`,
    };
  } catch (error) {
    logger.error({ event, organizationId, error }, "Error triggering webhooks");
    throw error;
  }
}

async function dispatchWebhook(
  webhook: {
    id: string;
    url: string;
    secret: string;
    customHeaders: unknown;
  },
  event: {
    id: string;
    event: string;
    payload: Record<string, unknown>;
  },
  deliveryId: string,
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    id: event.id,
    event: event.event,
    payload: event.payload,
    timestamp,
  });

  const signature = createHmac("sha256", webhook.secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Reloop-Signature": signature,
    "X-Reloop-Timestamp": timestamp.toString(),
    "User-Agent": "Reloop-Webhooks/1.0",
    ...((webhook.customHeaders as Record<string, string>) || {}),
  };

  const startTime = Date.now();
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body,
    });

    const durationMs = Date.now() - startTime;
    const responseText = await response.text();

    await db
      .update(schema.webhookDelivery)
      .set({
        status: response.ok ? "success" : "failed",
        responseStatus: response.status,
        responseBody: responseText,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        durationMs,
        completedAt: new Date(),
        lastAttemptAt: new Date(),
      })
      .where(eq(schema.webhookDelivery.id, deliveryId));

    // Update webhook success/failure counts
    await db
      .update(schema.webhook)
      .set({
        successCount: response.ok
          ? sql`${schema.webhook.successCount} + 1`
          : schema.webhook.successCount,
        failureCount: !response.ok
          ? sql`${schema.webhook.failureCount} + 1`
          : schema.webhook.failureCount,
        consecutiveFailures: response.ok
          ? 0
          : sql`${schema.webhook.consecutiveFailures} + 1`,
        lastTriggeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.webhook.id, webhook.id));
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await db
      .update(schema.webhookDelivery)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : String(error),
        durationMs,
        completedAt: new Date(),
        lastAttemptAt: new Date(),
      })
      .where(eq(schema.webhookDelivery.id, deliveryId));

    await db
      .update(schema.webhook)
      .set({
        failureCount: sql`${schema.webhook.failureCount} + 1`,
        consecutiveFailures: sql`${schema.webhook.consecutiveFailures} + 1`,
        lastTriggeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.webhook.id, webhook.id));
  }
}
