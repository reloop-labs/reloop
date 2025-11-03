import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

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

