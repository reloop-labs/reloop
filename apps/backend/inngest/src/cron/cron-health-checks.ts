import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { eq } from "drizzle-orm";

export const cronHealthChecks = inngest.createFunction(
    {
        id: "cron-health-checks",
        name: "System Health Monitoring",
    },
    {
        cron: "*/5 * * * *", // Every 5 minutes
    },
    async ({ step }: { step: any }) => {
        const health = await step.run("check-system-health", async () => {
            try {
                // Check database connection
                await db.select().from(schema.organization).limit(1);

                // Check webhook service
                const pendingDeliveries = await db
                    .select()
                    .from(schema.webhookDelivery)
                    .where(eq(schema.webhookDelivery.status, "pending"))
                    .limit(1);

                logger.info(
                    { pendingDeliveries: pendingDeliveries.length },
                    "Health check completed",
                );

                return {
                    status: "healthy",
                    database: "connected",
                    timestamp: new Date().toISOString(),
                };
            } catch (error) {
                logger.error(
                    {
                        error: error instanceof Error ? error.message : String(error),
                    },
                    "Health check failed",
                );

                return {
                    status: "unhealthy",
                    error: error instanceof Error ? error.message : String(error),
                    timestamp: new Date().toISOString(),
                };
            }
        });

        return health;
    },
);

