import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import type { DNSTypes } from "@reloop/domain/routes/dns/dns.type";

export async function getDNSRecordsHandler(
    domain: string,
    organizationId: string,
): Promise<DNSTypes.DNSRecordResponse[]> {
    logger.info({ domain }, "Getting DNS records for domain");

    try {
        const records = await db
            .select()
            .from(schema.domainDnsRecord)
            .where(and(eq(schema.domainDnsRecord.domain, domain), eq(schema.domainDnsRecord.organizationId, organizationId)));

        const mappedRecords = records.map((record) => ({
            recordType: record.recordType,
            name: record.name,
            value: record.value,
            ttl: record.ttl,
            priority: record.priority ?? undefined,
            description: record.description ?? undefined,
            isVerified: record.isVerified,
        }));

        logger.info(
            {
                domain,
                count: mappedRecords.length,
            },
            "DNS records retrieved successfully",
        );
        return mappedRecords;
    } catch (error) {
        logger.error({
            domain,
            error: error instanceof Error ? error.message : String(error),
        }, "Error getting DNS records");
        throw error;
    }
}
