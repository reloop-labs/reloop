import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import type { DNSTypes } from "../dns.type";

export async function verifyDNSRecordHandler(
    domain: string,
    body: DNSTypes.VerifyDNSBody,
): Promise<DNSTypes.VerifyDNSResponse> {
    logger.info(
        {
            domain,
            recordType: body.recordType,
            name: body.name,
        },
        "Verifying DNS record",
    );

    try {
        const domainRecord = await db
            .select({ id: schema.domain.id })
            .from(schema.domain)
            .where(eq(schema.domain.domain, domain))
            .limit(1);

        if (domainRecord.length === 0 || !domainRecord[0]) {
            logger.warn({ domain }, "Domain not found when verifying DNS record");
            return { verified: false };
        }

        await db
            .update(schema.domainDnsRecord)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(
                and(
                    eq(schema.domainDnsRecord.domainId, domainRecord[0].id),
                    eq(schema.domainDnsRecord.recordType, body.recordType as "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SRV" | "CAA" | "SPF" | "DKIM" | "DMARC"),
                    eq(schema.domainDnsRecord.name, body.name),
                ),
            );

        logger.info({
            domain,
            recordType: body.recordType,
            name: body.name,
        }, "DNS record marked as verified");

        return { verified: true };
    } catch (error) {
        logger.error({
            domain,
            recordType: body.recordType,
            name: body.name,
            error: error instanceof Error ? error.message : String(error),
        }, "Error verifying DNS record");
        return { verified: false };
    }
}
