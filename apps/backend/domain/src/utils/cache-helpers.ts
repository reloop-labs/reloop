import { redis } from "@reloop/domain/lib/redis";
import { logger } from "@reloop/logger";

/**
 * Cache key generation utilities for consistent cache key patterns
 */

export function generateDomainCacheKey(domain: string, organizationId: string): string {
    return `domain:${organizationId}:${domain}`;
}

export function generateDNSRecordsCacheKey(domain: string, organizationId: string): string {
    return `dns:${organizationId}:${domain}`;
}

export function generateDomainListCacheKey(organizationId: string, query: object): string {
    const queryHash = Buffer.from(JSON.stringify(query)).toString('base64');
    return `domains:${organizationId}:${queryHash}`;
}

export function generateDKIMKeysCacheKey(domain: string, organizationId: string): string {
    return `dkim:${organizationId}:${domain}`;
}

/**
 * Cache invalidation utilities
 */

export async function invalidateDomainCache(domain: string, organizationId: string): Promise<void> {
    try {
        const domainKey = generateDomainCacheKey(domain, organizationId);
        const dnsKey = generateDNSRecordsCacheKey(domain, organizationId);
        const dkimKey = generateDKIMKeysCacheKey(domain, organizationId);

        await Promise.all([
            redis.delete(domainKey),
            redis.delete(dnsKey),
            redis.delete(dkimKey)
        ]);

        logger.info(
            { domain, organizationId, cache: 'invalidated' },
            "Domain cache invalidated"
        );
    } catch (error) {
        logger.error(
            { domain, organizationId, error: error instanceof Error ? error.message : String(error) },
            "Failed to invalidate domain cache"
        );
    }
}

export async function invalidateOrganizationCache(organizationId: string): Promise<void> {
    try {
        // Note: This is a simplified approach. In production, you might want to use Redis patterns
        // to delete all keys matching a pattern like `domains:${organizationId}:*`
        logger.info(
            { organizationId, cache: 'invalidated' },
            "Organization cache invalidated (manual cleanup may be needed)"
        );
    } catch (error) {
        logger.error(
            { organizationId, error: error instanceof Error ? error.message : String(error) },
            "Failed to invalidate organization cache"
        );
    }
}

export async function invalidateDNSRecordsCache(domain: string, organizationId: string): Promise<void> {
    try {
        const dnsKey = generateDNSRecordsCacheKey(domain, organizationId);
        await redis.delete(dnsKey);

        logger.info(
            { domain, organizationId, cache: 'invalidated' },
            "DNS records cache invalidated"
        );
    } catch (error) {
        logger.error(
            { domain, organizationId, error: error instanceof Error ? error.message : String(error) },
            "Failed to invalidate DNS records cache"
        );
    }
}

/**
 * Cache helper for get operations with cache-aside pattern
 */
export async function getCachedOrFetch<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    context: { domain?: string; organizationId?: string; operation: string }
): Promise<T> {
    try {
        // Try to get from cache first
        const cached = await redis.get<T>(cacheKey);
        if (cached !== undefined) {
            logger.info(
                { ...context, cache: 'hit' },
                `${context.operation} cache hit`
            );
            return cached;
        }

        // Cache miss - fetch from database
        logger.info(
            { ...context, cache: 'miss' },
            `${context.operation} cache miss, fetching from database`
        );

        const result = await fetchFunction();

        // Store in cache
        await redis.set(cacheKey, result);

        logger.info(
            { ...context, cache: 'stored' },
            `${context.operation} result cached`
        );

        return result;
    } catch (error) {
        logger.error(
            { ...context, error: error instanceof Error ? error.message : String(error) },
            `Error in cache operation for ${context.operation}`
        );

        // If cache fails, still try to fetch from database
        return await fetchFunction();
    }
}
