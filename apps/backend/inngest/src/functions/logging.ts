import { db } from "@reloop/db/client";
import { logger } from "@reloop/logger";
import { inngest } from "../lib/inngest-client";

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
    async ({ event, step }: { event: { data: { eventType: string; eventData: Record<string, unknown>; organizationId?: string; userId?: string; metadata?: Record<string, unknown> } }; step: any }) => {
        const { eventType, eventData, organizationId, userId, metadata } = event.data;

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

        // Store event in database if needed
        // This is a placeholder - you might want to create an events table
        await step.run("store-event", async () => {
            // Placeholder: Store event in database
            // In production, you might want to:
            // 1. Create an events table
            // 2. Store structured event data
            // 3. Enable event querying and analytics

            logger.debug(
                {
                    eventType,
                    organizationId,
                    userId,
                },
                "Event stored",
            );
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

