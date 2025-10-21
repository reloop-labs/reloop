import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { formatDomainResponse } from "@reloop/domain/routes/domain/controllers/format-domain-response";
import type { DomainTypes } from "@reloop/domain/routes/domain/domain.type";
import {
    generateDomainCacheKey,
    getCachedOrFetch,
} from "@reloop/domain/utils/cache-helpers";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getDomain(
    domainName: string,
): Promise<DomainTypes.DomainResponse> {
    logger.info({ domain: domainName }, "Getting domain");

    try {
        const result = await db.query.domain.findFirst({
            where: and(
                eq(schema.domain.domain, domainName),
                isNull(schema.domain.deletedAt),
            ),
            with: {
                dnsRecords: true,
            },
        });

        if (!result) {
            logger.warn({ domain: domainName }, "Domain not found");
            throw status(404, { message: "Domain not found" });
        }

        logger.info({ domain: domainName }, "Domain retrieved successfully");
        return formatDomainResponse(result, result.dnsRecords || []);
    } catch (error) {
        logger.error(
            {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error getting domain",
        );
        throw error;
    }
}

export async function getDomainHandler(
    domainName: string,
    organizationId?: string,
): Promise<DomainTypes.DomainResponse> {
    logger.info({ domain: domainName, organizationId }, "Getting domain");

    try {
        // If we have organizationId, use caching
        if (organizationId) {
            const cacheKey = generateDomainCacheKey(domainName, organizationId);
            const domain = await getCachedOrFetch(
                cacheKey,
                () => getDomain(domainName),
                { domain: domainName, organizationId, operation: 'getDomain' }
            );
            logger.info({ domain: domainName, organizationId }, "Domain retrieved successfully");
            return domain;
        }

        // Fallback to direct database query if no organizationId
        const domain = await getDomain(domainName);
        logger.info({ domain: domainName }, "Domain retrieved successfully");
        return domain;
    } catch (error) {
        logger.error(
            {
                domain: domainName,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error getting domain",
        );
        throw error;
    }
}
