import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, like } from "drizzle-orm";
import { status } from "elysia";
import { DNSService } from "../dns/dns.service";
import type { DomainTypes } from "./domain.type";

export class DomainService {
    static async createDomain(
        organizationId: string,
        userId: string,
        domain: string,
        serverIP = "mail.reloop.sh",
    ): Promise<DomainTypes.DomainResponse> {
        logger.info({
            domain: domain,
            organizationId: organizationId,
            userId: userId,
        }, "Creating domain");
        try {
            const existingDomain = await db
                .select()
                .from(schema.domain)
                .where(and(eq(schema.domain.domain, domain), eq(schema.domain.organizationId, organizationId)))
                .limit(1);
            if (existingDomain.length > 0) {
                logger.warn({ domain }, "Domain already exists");
                throw status(409, { message: "Domain already exists" });
            }
            const newDomain = await db
                .insert(schema.domain)
                .values({
                    userId: userId,
                    organizationId: organizationId,
                    mailboxes: 50,
                    mailboxQuota: 5368709120,
                    quota: 10737418240,
                    rateLimit: 12,
                    active: true,
                    domain: domain,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            if (!newDomain[0]) {
                logger.error({ domain }, "Failed to create domain - no data returned");
                throw status(500, { message: "Failed to create domain" });
            }

            // Generate DNS records and DKIM keys
            try {
                await DNSService.generateAndInsertDNSRecords(
                    domain,
                    organizationId,
                    userId,
                    serverIP,
                );
                logger.info({
                    domain,
                }, "DNS records and DKIM keys generated successfully");
            } catch (dnsError) {
                logger.error({
                    domain,
                    error:
                        dnsError instanceof Error ? dnsError.message : String(dnsError),
                }, "Failed to generate DNS records and DKIM keys");
                // Continue with domain creation even if DNS generation fails
                // The domain can still be created and DNS records can be generated later
            }

            logger.info({
                domain,
                id: newDomain[0].domain,
            }, "Domain created successfully");
            return DomainService.formatDomainResponse(newDomain[0]);
        } catch (error) {
            logger.error({
                domain,
                error: error instanceof Error ? error.message : String(error),
            }, "Error creating domain");
            if (error instanceof Error && error.message.includes("already exists")) {
                throw status(409, { message: "Domain already exists" });
            }
            throw error;
        }
    }

    static async getDomain(domainName: string): Promise<DomainTypes.DomainResponse> {
        logger.info({ domain: domainName }, "Getting domain");

        try {
            const result = await db
                .select()
                .from(schema.domain)
                .where(eq(schema.domain.domain, domainName))
                .limit(1);

            if (result.length === 0) {
                logger.warn({ domain: domainName }, "Domain not found");
                throw status(404, { message: "Domain not found" });
            }

            if (!result[0]) {
                logger.warn({ domain: domainName }, "Domain not found - null result");
                throw status(404, { message: "Domain not found" });
            }

            logger.info({ domain: domainName }, "Domain retrieved successfully");
            return DomainService.formatDomainResponse(result[0]);
        } catch (error) {
            logger.error({
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            }, "Error getting domain");
            throw error;
        }
    }

    static async deleteDomain(domainName: string): Promise<void> {
        logger.info({ domain: domainName }, "Deleting domain");

        try {
            const result = await db
                .delete(schema.domain)
                .where(eq(schema.domain.domain, domainName))
                .returning();

            if (result.length === 0) {
                logger.warn({ domain: domainName }, "Domain not found for deletion");
                throw status(404, { message: "Domain not found" });
            }

            logger.info({ domain: domainName }, "Domain deleted successfully");
        } catch (error) {
            logger.error({
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            }, "Error deleting domain");
            throw error;
        }
    }

    static async listDomains(query: DomainTypes.DomainQuery): Promise<DomainTypes.DomainListResponse> {
        const { page = 1, limit = 10, active, organizationId, userId } = query;
        const offset = (page - 1) * limit;

        logger.info({
            page,
            limit,
            active,
            organizationId,
            userId,
        }, "Listing domains");

        try {
            const conditions = [];
            if (active !== undefined) {
                conditions.push(eq(schema.domain.active, active));
            }
            if (organizationId) {
                conditions.push(eq(schema.domain.organizationId, organizationId));
            }
            if (userId) {
                conditions.push(eq(schema.domain.userId, userId));
            }

            const whereClause =
                conditions.length > 0 ? and(...conditions) : undefined;

            const totalResult = await db
                .select({ count: count() })
                .from(schema.domain)
                .where(whereClause);

            const total = totalResult[0]?.count || 0;

            const domains = await db
                .select()
                .from(schema.domain)
                .where(whereClause)
                .orderBy(desc(schema.domain.createdAt))
                .limit(limit)
                .offset(offset);

            logger.info({
                total,
                page,
                limit,
                count: domains.length,
            }, "Domains listed successfully");

            return {
                domains: domains.map((domain) =>
                    DomainService.formatDomainResponse(domain),
                ),
                total,
                page,
                limit,
            };
        } catch (error) {
            logger.error({
                query,
                error: error instanceof Error ? error.message : String(error),
            }, "Error listing domains");
            throw error;
        }
    }

    static async searchDomains(
        searchTerm: string,
        query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">,
    ): Promise<DomainTypes.DomainListResponse> {
        const { page = 1, limit = 10, active } = query;
        const offset = (page - 1) * limit;

        logger.info({ searchTerm, page, limit, active }, "Searching domains");

        try {
            const conditions = [like(schema.domain.domain, `%${searchTerm}%`)];
            if (active !== undefined) {
                conditions.push(eq(schema.domain.active, active));
            }

            const whereClause = and(...conditions);

            const totalResult = await db
                .select({ count: count() })
                .from(schema.domain)
                .where(whereClause);

            const total = totalResult[0]?.count || 0;

            const domains = await db
                .select()
                .from(schema.domain)
                .where(whereClause)
                .orderBy(desc(schema.domain.createdAt))
                .limit(limit)
                .offset(offset);

            logger.info({
                searchTerm,
                total,
                page,
                limit,
                count: domains.length,
            }, "Domain search completed");

            return {
                domains: domains.map((domain) =>
                    DomainService.formatDomainResponse(domain),
                ),
                total,
                page,
                limit,
            };
        } catch (error) {
            logger.error({
                searchTerm,
                query,
                error: error instanceof Error ? error.message : String(error),
            }, "Error searching domains");
            throw error;
        }
    }

    static async domainExists(domainName: string): Promise<boolean> {
        logger.info({ domain: domainName }, "Checking if domain exists");

        try {
            const result = await db
                .select({ domain: schema.domain.domain })
                .from(schema.domain)
                .where(eq(schema.domain.domain, domainName))
                .limit(1);

            const exists = result.length > 0;
            logger.info({
                domain: domainName,
                exists,
            }, "Domain existence check completed");
            return exists;
        } catch (error) {
            logger.error({
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            }, "Error checking domain existence");
            throw error;
        }
    }

    private static formatDomainResponse(domain: {
        domain: string;
        organizationId: string;
        userId: string;
        mailboxes: number;
        mailboxQuota: number;
        quota: number;
        rateLimit: number | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): DomainTypes.DomainResponse {
        return {
            domain: domain.domain,
            organizationId: domain.organizationId,
            userId: domain.userId,
            mailboxes: domain.mailboxes,
            mailboxQuota: domain.mailboxQuota,
            quota: domain.quota,
            rateLimit: domain.rateLimit,
            active: domain.active,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        };
    }
}

export class DomainServiceHandler {
    static async createDomain(
        organizationId: string,
        userId: string,
        body: DomainTypes.CreateDomainRequest,
    ): Promise<DomainTypes.DomainResponse> {
        logger.info({
            domain: body.domain,
            organizationId,
            userId,
        }, "Creating domain");

        try {
            const domain = await DomainService.createDomain(
                organizationId,
                userId,
                body.domain,
                'mail.reloop.sh'
            );

            logger.info({
                domain: body.domain,
                organizationId,
                userId,
            }, "Domain created successfully");

            return domain;
        } catch (error) {
            logger.error({
                domain: body.domain,
                organizationId,
                userId,
                error: error instanceof Error ? error.message : String(error),
            }, "Error creating domain");
            throw error;
        }
    }

    static async getDomain(domainName: string): Promise<DomainTypes.DomainResponse> {
        logger.info({ domain: domainName }, "Getting domain");

        try {
            const domain = await DomainService.getDomain(domainName);
            logger.info({ domain: domainName }, "Domain retrieved successfully");
            return domain;
        } catch (error) {
            logger.error({
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            }, "Error getting domain");
            throw error;
        }
    }

    static async deleteDomain(domainName: string): Promise<{ message: string }> {
        logger.info({ domain: domainName }, "Deleting domain");

        try {
            await DomainService.deleteDomain(domainName);
            const response = { message: "Domain deleted successfully" };
            logger.info({ domain: domainName }, "Domain deleted successfully");
            return response;
        } catch (error) {
            logger.error({
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            }, "Error deleting domain");
            throw error;
        }
    }

    static async listDomains(query: DomainTypes.DomainQuery): Promise<DomainTypes.DomainListResponse> {
        logger.info({ query }, "Listing domains");

        try {
            const result = await DomainService.listDomains(query);
            logger.info({
                total: result.total,
                page: result.page,
                limit: result.limit,
                count: result.domains.length,
            }, "Domains listed successfully");
            return result;
        } catch (error) {
            logger.error({
                query,
                error: error instanceof Error ? error.message : String(error),
            }, "Error listing domains");
            throw error;
        }
    }

    static async searchDomains(
        searchTerm: string,
        query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">,
    ): Promise<DomainTypes.DomainListResponse> {
        logger.info({ searchTerm, query }, "Searching domains");

        try {
            const result = await DomainService.searchDomains(searchTerm, query);
            logger.info({
                searchTerm,
                total: result.total,
                page: result.page,
                limit: result.limit,
                count: result.domains.length,
            }, "Domain search completed");
            return result;
        } catch (error) {
            logger.error({
                searchTerm,
                query,
                error: error instanceof Error ? error.message : String(error),
            }, "Error searching domains");
            throw error;
        }
    }
}
