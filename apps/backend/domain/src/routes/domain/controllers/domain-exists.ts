import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export async function domainExists(domainName: string): Promise<boolean> {
    logger.info({ domain: domainName }, "Checking if domain exists");

    try {
        const result = await db
            .select({ domain: schema.domain.domain })
            .from(schema.domain)
            .where(and(eq(schema.domain.domain, domainName), isNull(schema.domain.deletedAt)))
            .limit(1);

        const exists = result.length > 0;
        logger.info(
            {
                domain: domainName,
                exists,
            },
            "Domain existence check completed",
        );
        return exists;
    } catch (error) {
        logger.error(
            {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error checking domain existence",
        );
        throw error;
    }
}
