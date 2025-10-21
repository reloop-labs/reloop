import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import type { DNSTypes } from "../dns.type";

export async function getDKIMKeysHandler(
    domain: string,
    organizationId: string,
): Promise<DNSTypes.DKIMKeysResponse | null> {
    logger.info({ domain }, "Getting DKIM keys for domain");

    try {
        const domainRecord = await db
            .select({ dkimSelector: schema.domain.dkimSelector, })
            .from(schema.domain)
            .where(and(eq(schema.domain.domain, domain), eq(schema.domain.organizationId, organizationId)))
            .limit(1);

        if (domainRecord.length === 0 || !domainRecord[0]) {
            logger.warn({ domain }, "Domain not found when getting DKIM keys");
            return null;
        }
        logger.warn({ domain }, "DKIM keys storage not fully implemented in schema");
        return null;
    } catch (error) {
        logger.error({
            domain,
            error: error instanceof Error ? error.message : String(error),
        }, "Error getting DKIM keys");
        throw error;
    }
}
