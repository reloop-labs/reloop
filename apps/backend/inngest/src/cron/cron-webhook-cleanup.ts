import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { lt } from "drizzle-orm";

export const cronWebhookCleanup = inngest.createFunction(
    {
        id: "cron-webhook-cleanup",
        name: "Webhook Delivery Cleanup",
    },
    {
        cron: "0 2 * * *", // Daily at 2 AM
    },
    async ({ step }: { step: any }) => {
        const deletedCount = await step.run("cleanup-old-deliveries", async () => {
            // Delete deliveries older than 90 days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            const result = await db
                .delete(schema.webhookDelivery)
                .where(lt(schema.webhookDelivery.createdAt, cutoffDate))
                .returning({ id: schema.webhookDelivery.id });

            logger.info(
                { count: result.length },
                "Cleaned up old webhook deliveries",
            );

            return result.length;
        });

        return {
            deletedCount,
        };
    },
);

