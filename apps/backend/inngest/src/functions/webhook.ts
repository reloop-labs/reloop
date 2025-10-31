import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { inngest } from "../lib/inngest-client";


export const webhookDeliver = inngest.createFunction(
    {
        id: "webhook-deliver",
        name: "Deliver Webhook",
        retries: 5,
    },
    {
        event: "webhook/deliver",
    },
    async ({ event, step }: { event: { data: { deliveryId: string; webhookId: string; eventId: string; eventData: Record<string, unknown>; requestUrl: string; requestHeaders?: Record<string, string>; requestBody?: Record<string, unknown>; maxAttempts: number } }; step: any }) => {
        const {
            deliveryId,
            webhookId,
            eventId: _eventId,
            eventData,
            requestUrl,
            requestHeaders,
            requestBody,
            maxAttempts,
        } = event.data;

        // Fetch webhook details
        const webhook = await step.run("fetch-webhook", async () => {
            const webhookData = await db.query.webhook.findFirst({
                where: and(
                    eq(schema.webhook.id, webhookId),
                    isNull(schema.webhook.deletedAt),
                ),
            });

            if (!webhookData) {
                throw new Error(`Webhook not found: ${webhookId}`);
            }

            return webhookData;
        });

        // Check webhook status
        await step.run("check-webhook-status", async () => {
            if (webhook.status !== "active") {
                logger.warn(
                    { webhookId, status: webhook.status },
                    "Webhook is not active, skipping delivery",
                );
                throw new Error(`Webhook is not active: ${webhook.status}`);
            }
        });

        // Prepare request headers
        const headers = await step.run("prepare-headers", async () => {
            const defaultHeaders: Record<string, string> = {
                "Content-Type": "application/json",
                "User-Agent": "Reloop-Webhook/1.0",
            };

            if (webhook.secret) {
                const crypto = await import("node:crypto");
                const payload = JSON.stringify(eventData);
                const signature = crypto
                    .createHmac("sha256", webhook.secret)
                    .update(payload)
                    .digest("hex");
                defaultHeaders["X-Webhook-Signature"] = `sha256=${signature}`;
            }

            if (webhook.customHeaders) {
                Object.assign(defaultHeaders, webhook.customHeaders);
            }

            if (requestHeaders) {
                Object.assign(defaultHeaders, requestHeaders);
            }

            return defaultHeaders;
        });

        // Send webhook
        const response = await step.run(
            "send-webhook",
            async () => {
                const payload = requestBody || eventData;

                const fetchResponse = await fetch(requestUrl, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });

                const responseBody = await fetchResponse.text();
                const responseHeaders: Record<string, string> = {};
                fetchResponse.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });

                return {
                    status: fetchResponse.status,
                    statusText: fetchResponse.statusText,
                    body: responseBody,
                    headers: responseHeaders,
                };
            },
            {
                retries: maxAttempts - 1,
            },
        );

        // Update delivery status
        await step.run("update-delivery-status", async () => {
            const isSuccess = response.status >= 200 && response.status < 300;

            await db
                .update(schema.webhookDelivery)
                .set({
                    status: isSuccess ? "success" : "failed",
                    responseStatus: response.status,
                    responseBody: response.body,
                    responseHeaders: response.headers,
                    lastAttemptAt: new Date(),
                    completedAt: isSuccess ? new Date() : null,
                    errorMessage: isSuccess ? null : `HTTP ${response.status}: ${response.statusText}`,
                })
                .where(eq(schema.webhookDelivery.id, deliveryId));

            // Update webhook statistics
            const webhookStats = await db.query.webhook.findFirst({
                where: eq(schema.webhook.id, webhookId),
                columns: {
                    successCount: true,
                    failureCount: true,
                    consecutiveFailures: true,
                },
            });

            if (isSuccess) {
                await db
                    .update(schema.webhook)
                    .set({
                        successCount: (webhookStats?.successCount || 0) + 1,
                        lastTriggeredAt: new Date(),
                        consecutiveFailures: 0,
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.webhook.id, webhookId));
            } else {
                await db
                    .update(schema.webhook)
                    .set({
                        failureCount: (webhookStats?.failureCount || 0) + 1,
                        consecutiveFailures: (webhookStats?.consecutiveFailures || 0) + 1,
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.webhook.id, webhookId));
            }

            logger.info(
                {
                    deliveryId,
                    webhookId,
                    status: response.status,
                    success: isSuccess,
                },
                "Webhook delivery completed",
            );
        });

        return {
            success: response.status >= 200 && response.status < 300,
            status: response.status,
            deliveryId,
        };
    },
);

