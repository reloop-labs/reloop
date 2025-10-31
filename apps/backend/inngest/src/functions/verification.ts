import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

// Domain verification workflow
export const verifyDomain = inngest.createFunction(
    {
        id: "verify-domain",
        name: "Verify Domain",
        retries: 3,
    },
    {
        event: "verify/domain",
    },
    async ({
        event,
        step,
    }: {
        event: {
            data: { domainId: string; domain: string; organizationId: string };
        };
        step: any;
    }) => {
        const { domainId, domain, organizationId } = event.data;

        // Fetch domain details
        const domainRecord = await step.run("fetch-domain", async () => {
            const domainData = await db.query.domain.findFirst({
                where: and(
                    eq(schema.domain.id, domainId),
                    eq(schema.domain.organizationId, organizationId),
                    isNull(schema.domain.deletedAt),
                ),
                with: {
                    dnsRecords: true,
                },
            });

            if (!domainData) {
                throw new Error(`Domain not found: ${domainId}`);
            }

            return domainData;
        });

        // Check DNS records
        const dnsStatus = await step.run("check-dns-records", async () => {
            const requiredRecords = ["SPF", "DKIM", "DMARC"];
            const records = domainRecord.dnsRecords || [];
            const foundRecords = new Set(
                records
                    .filter((r: { recordType: string }) =>
                        requiredRecords.includes(r.recordType),
                    )
                    .map((r: { recordType: string }) => r.recordType),
            );

            const allFound = requiredRecords.every((type) => foundRecords.has(type));

            return {
                allFound,
                foundRecords: Array.from(foundRecords),
                missingRecords: requiredRecords.filter(
                    (type) => !foundRecords.has(type),
                ),
            };
        });

        // Update domain status
        await step.run("update-domain-status", async () => {
            if (dnsStatus.allFound) {
                await db
                    .update(schema.domain)
                    .set({
                        status: "active",
                        dnsConfigured: true,
                        systemVerified: true,
                        lastVerifiedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.domain.id, domainId));

                logger.info({ domainId, domain }, "Domain verified successfully");
            } else {
                await db
                    .update(schema.domain)
                    .set({
                        status: "start-verify",
                        dnsConfigured: false,
                        verificationFailedReason: `Missing DNS records: ${dnsStatus.missingRecords.join(", ")}`,
                        lastVerifiedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.domain.id, domainId));

                logger.warn(
                    {
                        domainId,
                        domain,
                        missingRecords: dnsStatus.missingRecords,
                    },
                    "Domain verification failed - missing DNS records",
                );
            }
        });

        return {
            domainId,
            domain,
            verified: dnsStatus.allFound,
            missingRecords: dnsStatus.missingRecords,
        };
    },
);

// DNS record verification workflow
export const verifyDNSRecord = inngest.createFunction(
    {
        id: "verify-dns-record",
        name: "Verify DNS Record",
        retries: 5,
    },
    {
        event: "verify/dns-record",
    },
    async ({
        event,
        step,
    }: {
        event: {
            data: {
                dnsRecordId: string;
                domainId: string;
                recordType: string;
                name: string;
                value: string;
                organizationId: string;
            };
        };
        step: any;
    }) => {
        const {
            dnsRecordId,
            domainId: _domainId,
            recordType,
            name,
            value: _value,
            organizationId,
        } = event.data;

        // Fetch DNS record
        const dnsRecord = await step.run("fetch-dns-record", async () => {
            const record = await db.query.domainDnsRecord.findFirst({
                where: and(
                    eq(schema.domainDnsRecord.id, dnsRecordId),
                    eq(schema.domainDnsRecord.organizationId, organizationId),
                    isNull(schema.domainDnsRecord.deletedAt),
                ),
                with: {
                    domain: true,
                },
            });

            if (!record) {
                throw new Error(`DNS record not found: ${dnsRecordId}`);
            }

            return record;
        });

        // Verify DNS record (simplified - you would use actual DNS lookup here)
        const verified = await step.run("perform-dns-lookup", async () => {
            try {
                // In a real implementation, you would perform actual DNS lookup here
                // For now, we'll simulate verification
                // You can use dns.promises.resolveTxt() or similar for actual DNS verification

                logger.info(
                    {
                        dnsRecordId,
                        domain: dnsRecord.domain.domain,
                        recordType,
                        name,
                    },
                    "Performing DNS lookup",
                );

                // Placeholder: In production, implement actual DNS lookup
                // const dns = await import("node:dns/promises");
                // const records = await dns.resolveTxt(name);
                // const found = records.some((record) => record.includes(value));

                // For now, return true if the record exists in the database
                return true;
            } catch (error) {
                logger.error(
                    {
                        dnsRecordId,
                        error: error instanceof Error ? error.message : String(error),
                    },
                    "DNS lookup failed",
                );
                return false;
            }
        });

        // Update DNS record status
        await step.run("update-dns-record-status", async () => {
            await db
                .update(schema.domainDnsRecord)
                .set({
                    isVerified: verified,
                    isActive: verified ? true : false,
                    verificationError: verified ? null : "DNS record not found",
                    updatedAt: new Date(),
                })
                .where(eq(schema.domainDnsRecord.id, dnsRecordId));

            if (verified) {
                logger.info({ dnsRecordId }, "DNS record verified successfully");
            } else {
                logger.warn({ dnsRecordId }, "DNS record verification failed");
            }
        });

        return {
            dnsRecordId,
            verified,
        };
    },
);
