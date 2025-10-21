import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import type { DNSTypes } from "../dns.type";

export async function deleteDNSRecordsHandler(
    domain: string,
    organizationId: string,
): Promise<DNSTypes.DeleteDNSResponse> {
    logger.info({ domain, organizationId }, "Deleting DNS records for domain");

    try {
        await db
            .delete(schema.domainDnsRecord)
            .where(and(eq(schema.domainDnsRecord.domain, domain), eq(schema.domainDnsRecord.organizationId, organizationId)));
        logger.info({ domain, organizationId }, "DNS records deleted successfully");

        const response: DNSTypes.DeleteDNSResponse = {
            message: "DNS records and DKIM keys deleted successfully",
        };
        return response;
    } catch (error) {
        logger.error({
            domain,
            error: error instanceof Error ? error.message : String(error),
        }, "Error deleting DNS records");
        throw error;
    }
}
