import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq, isNull, lt } from "drizzle-orm";

// Domain verification cron job
export const cronDomainVerification = inngest.createFunction(
    {
        id: "cron-domain-verification",
        name: "Periodic Domain Verification",
    },
    {
        cron: "*/15 * * * *", // Every 15 minutes
    },
    async ({ step }: { step: any }) => {
        // Find domains that need verification
        const domains = await step.run("find-domains-to-verify", async () => {
            const domainsToVerify = await db
                .select()
                .from(schema.domain)
                .where(
                    and(
                        eq(schema.domain.status, "start-verify"),
                        isNull(schema.domain.deletedAt),
                    ),
                )
                .limit(50);

            logger.info({ count: domainsToVerify.length }, "Found domains to verify");

            return domainsToVerify;
        });

        // Trigger verification for each domain
        await step.run("trigger-verifications", async () => {
            await Promise.all(
                domains.map(
                    (domain: { id: string; domain: string; organizationId: string }) =>
                        inngest.send({
                            name: "verify/domain",
                            data: {
                                domainId: domain.id,
                                domain: domain.domain,
                                organizationId: domain.organizationId,
                            },
                        }),
                ),
            );

            logger.info({ count: domains.length }, "Triggered domain verifications");
        });

        return {
            domainsChecked: domains.length,
        };
    },
);

// DNS verification cron job
export const cronDNSVerification = inngest.createFunction(
    {
        id: "cron-dns-verification",
        name: "Periodic DNS Verification",
    },
    {
        cron: "*/10 * * * *", // Every 10 minutes
    },
    async ({ step }: { step: any }) => {
        // Find DNS records that need verification
        const dnsRecords = await step.run("find-dns-to-verify", async () => {
            const recordsToVerify = await db
                .select()
                .from(schema.domainDnsRecord)
                .where(
                    and(
                        eq(schema.domainDnsRecord.isVerified, false),
                        eq(schema.domainDnsRecord.isActive, true),
                        isNull(schema.domainDnsRecord.deletedAt),
                    ),
                )
                .limit(100);

            logger.info(
                { count: recordsToVerify.length },
                "Found DNS records to verify",
            );

            return recordsToVerify;
        });

        // Trigger verification for each DNS record
        await step.run("trigger-dns-verifications", async () => {
            await Promise.all(
                dnsRecords.map(
                    (record: {
                        id: string;
                        domainId: string;
                        recordType: string;
                        name: string;
                        value: string;
                        organizationId: string;
                    }) =>
                        inngest.send({
                            name: "verify/dns-record",
                            data: {
                                dnsRecordId: record.id,
                                domainId: record.domainId,
                                recordType: record.recordType,
                                name: record.name,
                                value: record.value,
                                organizationId: record.organizationId,
                            },
                        }),
                ),
            );

            logger.info(
                { count: dnsRecords.length },
                "Triggered DNS record verifications",
            );
        });

        return {
            recordsChecked: dnsRecords.length,
        };
    },
);

// Webhook cleanup cron job
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

// Health checks cron job
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

