import { db } from "@reloop/db/client";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import analytics from "@reloop/analytics/backend";

// Event logging function
export const logEvent = inngest.createFunction(
    {
        id: "log-event",
        name: "Log Event",
        retries: 2,
    },
    {
        event: "log/event",
    },
    async ({
        event,
        step,
    }: {
        event: {
            data: {
                eventType: string;
                eventData: Record<string, unknown>;
                organizationId?: string;
                userId?: string;
                metadata?: Record<string, unknown>;
            };
        };
        step: any;
    }) => {
        const { eventType, eventData, organizationId, userId, metadata } =
            event.data;

        // Log to console/file
        await step.run("log-to-stdout", async () => {
            logger.info(
                {
                    eventType,
                    eventData,
                    organizationId,
                    userId,
                    metadata,
                    timestamp: new Date().toISOString(),
                },
                `Event logged: ${eventType}`,
            );
        });

        // Store event in ClickHouse analytics database
        await step.run("store-event", async () => {
            const analyticsInstance = analytics();

            // Determine distinct_id (userId takes precedence)
            const distinctId = userId || organizationId || "anonymous";

            // Combine eventData and metadata into properties
            const properties = {
                ...eventData,
                ...(metadata || {}),
            };

            try {
                await analyticsInstance.s.event(
                    eventType,
                    distinctId,
                    properties,
                    {
                        organizationId: organizationId || null,
                        requestContext: {
                            // Extract any relevant context from eventData
                            userAgent: eventData.userAgent as string,
                            url: eventData.url as string,
                            referer: eventData.referer as string,
                        },
                    },
                );

                logger.debug(
                    {
                        eventType,
                        organizationId,
                        userId,
                    },
                    "Event stored in ClickHouse",
                );
            } catch (error) {
                logger.error(
                    {
                        error,
                        eventType,
                        organizationId,
                        userId,
                    },
                    "Failed to store event in ClickHouse",
                );
                // Don't throw - we want to continue even if analytics fails
            }
        });

        // Trigger any follow-up actions based on event type
        await step.run("trigger-follow-ups", async () => {
            // Example: Trigger webhooks for certain events
            if (eventType.startsWith("user.") || eventType.startsWith("email.")) {
                await inngest.send({
                    name: "webhook/trigger",
                    data: {
                        eventType,
                        eventData,
                        organizationId,
                    },
                });
            }
        });

        return {
            success: true,
            eventType,
            timestamp: new Date().toISOString(),
        };
    },
);

