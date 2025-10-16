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
        serverIP = "127.0.0.1",
    ): Promise<DomainTypes.DomainResponse> {
        logger.info("Creating domain", {
            domain: domain,
            organizationId: organizationId,
            userId: userId,
        });

        try {
            const existingDomain = await db
                .select()
                .from(schema.domain)
                .where(eq(schema.domain.domain, domain))
                .limit(1);

            if (existingDomain.length > 0) {
                logger.warn("Domain already exists", { domain: domain });
                throw status(409, "Domain already exists" as const);
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
                logger.error("Failed to create domain - no data returned", { domain });
                throw status(500, "Failed to create domain" as const);
            }

            // Generate DNS records and DKIM keys
            try {
                await DNSService.generateAndInsertDNSRecords(
                    domain,
                    organizationId,
                    userId,
                    serverIP,
                );
                logger.info("DNS records and DKIM keys generated successfully", {
                    domain,
                });
            } catch (dnsError) {
                logger.error("Failed to generate DNS records and DKIM keys", {
                    domain,
                    error:
                        dnsError instanceof Error ? dnsError.message : String(dnsError),
                });
                // Continue with domain creation even if DNS generation fails
                // The domain can still be created and DNS records can be generated later
            }

            logger.info("Domain created successfully", {
                domain,
                id: newDomain[0].domain,
            });
            return DomainService.formatDomainResponse(newDomain[0]);
        } catch (error) {
            logger.error("Error creating domain", {
                domain,
                error: error instanceof Error ? error.message : String(error),
            });
            if (error instanceof Error && error.message.includes("already exists")) {
                throw status(409, "Domain already exists" as const);
            }
            throw error;
        }
    }

    static async getDomain(domainName: string): Promise<DomainTypes.DomainResponse> {
        logger.info("Getting domain", { domain: domainName });

        try {
            const result = await db
                .select()
                .from(schema.domain)
                .where(eq(schema.domain.domain, domainName))
                .limit(1);

            if (result.length === 0) {
                logger.warn("Domain not found", { domain: domainName });
                throw status(404, "Domain not found" as const);
            }

            if (!result[0]) {
                logger.warn("Domain not found - null result", { domain: domainName });
                throw status(404, "Domain not found" as const);
            }

            logger.info("Domain retrieved successfully", { domain: domainName });
            return DomainService.formatDomainResponse(result[0]);
        } catch (error) {
            logger.error("Error getting domain", {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async deleteDomain(domainName: string): Promise<void> {
        logger.info("Deleting domain", { domain: domainName });

        try {
            const result = await db
                .delete(schema.domain)
                .where(eq(schema.domain.domain, domainName))
                .returning();

            if (result.length === 0) {
                logger.warn("Domain not found for deletion", { domain: domainName });
                throw status(404, "Domain not found" as const);
            }

            logger.info("Domain deleted successfully", { domain: domainName });
        } catch (error) {
            logger.error("Error deleting domain", {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async listDomains(query: DomainTypes.DomainQuery): Promise<DomainTypes.DomainListResponse> {
        const { page = 1, limit = 10, active, organizationId, userId } = query;
        const offset = (page - 1) * limit;

        logger.info("Listing domains", {
            page,
            limit,
            active,
            organizationId,
            userId,
        });

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

            logger.info("Domains listed successfully", {
                total,
                page,
                limit,
                count: domains.length,
            });

            return {
                domains: domains.map((domain) =>
                    DomainService.formatDomainResponse(domain),
                ),
                total,
                page,
                limit,
            };
        } catch (error) {
            logger.error("Error listing domains", {
                query,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async searchDomains(
        searchTerm: string,
        query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">,
    ): Promise<DomainTypes.DomainListResponse> {
        const { page = 1, limit = 10, active } = query;
        const offset = (page - 1) * limit;

        logger.info("Searching domains", { searchTerm, page, limit, active });

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

            logger.info("Domain search completed", {
                searchTerm,
                total,
                page,
                limit,
                count: domains.length,
            });

            return {
                domains: domains.map((domain) =>
                    DomainService.formatDomainResponse(domain),
                ),
                total,
                page,
                limit,
            };
        } catch (error) {
            logger.error("Error searching domains", {
                searchTerm,
                query,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async domainExists(domainName: string): Promise<boolean> {
        logger.info("Checking if domain exists", { domain: domainName });

        try {
            const result = await db
                .select({ domain: schema.domain.domain })
                .from(schema.domain)
                .where(eq(schema.domain.domain, domainName))
                .limit(1);

            const exists = result.length > 0;
            logger.info("Domain existence check completed", {
                domain: domainName,
                exists,
            });
            return exists;
        } catch (error) {
            logger.error("Error checking domain existence", {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            });
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
        logger.info("Creating domain", {
            domain: body.domain,
            organizationId,
            userId,
            serverIP: body.serverIP,
        });

        try {
            const domain = await DomainService.createDomain(
                organizationId,
                userId,
                body.domain,
                body.serverIP || "127.0.0.1",
            );

            logger.info("Domain created successfully", {
                domain: body.domain,
                organizationId,
                userId,
            });

            return domain;
        } catch (error) {
            logger.error("Error creating domain", {
                domain: body.domain,
                organizationId,
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async getDomain(domainName: string): Promise<DomainTypes.DomainResponse> {
        logger.info("Getting domain", { domain: domainName });

        try {
            const domain = await DomainService.getDomain(domainName);
            logger.info("Domain retrieved successfully", { domain: domainName });
            return domain;
        } catch (error) {
            logger.error("Error getting domain", {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async deleteDomain(domainName: string): Promise<{ message: string }> {
        logger.info("Deleting domain", { domain: domainName });

        try {
            await DomainService.deleteDomain(domainName);
            const response = { message: "Domain deleted successfully" };
            logger.info("Domain deleted successfully", { domain: domainName });
            return response;
        } catch (error) {
            logger.error("Error deleting domain", {
                domain: domainName,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async listDomains(query: DomainTypes.DomainQuery): Promise<DomainTypes.DomainListResponse> {
        logger.info("Listing domains", { query });

        try {
            const result = await DomainService.listDomains(query);
            logger.info("Domains listed successfully", {
                total: result.total,
                page: result.page,
                limit: result.limit,
                count: result.domains.length,
            });
            return result;
        } catch (error) {
            logger.error("Error listing domains", {
                query,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    static async searchDomains(
        searchTerm: string,
        query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">,
    ): Promise<DomainTypes.DomainListResponse> {
        logger.info("Searching domains", { searchTerm, query });

        try {
            const result = await DomainService.searchDomains(searchTerm, query);
            logger.info("Domain search completed", {
                searchTerm,
                total: result.total,
                page: result.page,
                limit: result.limit,
                count: result.domains.length,
            });
            return result;
        } catch (error) {
            logger.error("Error searching domains", {
                searchTerm,
                query,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
