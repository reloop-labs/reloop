import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, count, desc, eq, like } from "drizzle-orm";
import { status } from "elysia";
import type { DomainModel } from "./model";

type CreateDomainBody = DomainModel.CreateDomainBody;
type DomainListResponse = DomainModel.DomainListResponse;
type DomainQuery = DomainModel.DomainQuery;
type DomainResponse = DomainModel.DomainResponse;
type UpdateDomainBody = DomainModel.UpdateDomainBody;

export class DomainService {
    static async createDomain(data: CreateDomainBody): Promise<DomainResponse> {
        try {
            const existingDomain = await db
                .select()
                .from(schema.domain)
                .where(eq(schema.domain.domain, data.domain))
                .limit(1);

            if (existingDomain.length > 0) {
                throw status(409, "Domain already exists" as const);
            }

            const newDomain = await db
                .insert(schema.domain)
                .values({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            if (!newDomain[0]) {
                throw status(500, "Failed to create domain" as const);
            }
            return DomainService.formatDomainResponse(newDomain[0]);
        } catch (error) {
            if (error instanceof Error && error.message.includes("already exists")) {
                throw status(409, "Domain already exists" as const);
            }
            throw error;
        }
    }

    static async getDomain(domainName: string): Promise<DomainResponse> {
        const result = await db
            .select()
            .from(schema.domain)
            .where(eq(schema.domain.domain, domainName))
            .limit(1);

        if (result.length === 0) {
            throw status(404, "Domain not found" as const);
        }

        if (!result[0]) {
            throw status(404, "Domain not found" as const);
        }
        return DomainService.formatDomainResponse(result[0]);
    }

    static async updateDomain(
        domainName: string,
        data: UpdateDomainBody,
    ): Promise<DomainResponse> {
        const existingDomain = await db
            .select()
            .from(schema.domain)
            .where(eq(schema.domain.domain, domainName))
            .limit(1);

        if (existingDomain.length === 0) {
            throw status(404, "Domain not found" as const);
        }

        const updatedDomain = await db
            .update(schema.domain)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(schema.domain.domain, domainName))
            .returning();

        if (!updatedDomain[0]) {
            throw status(500, "Failed to update domain" as const);
        }
        return DomainService.formatDomainResponse(updatedDomain[0]);
    }

    static async deleteDomain(domainName: string): Promise<void> {
        const result = await db
            .delete(schema.domain)
            .where(eq(schema.domain.domain, domainName))
            .returning();

        if (result.length === 0) {
            throw status(404, "Domain not found" as const);
        }
    }

    static async listDomains(query: DomainQuery): Promise<DomainListResponse> {
        const { page = 1, limit = 10, active, organizationId, userId } = query;
        const offset = (page - 1) * limit;

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

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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

        return {
            domains: domains.map((domain) =>
                DomainService.formatDomainResponse(domain),
            ),
            total,
            page,
            limit,
        };
    }

    static async searchDomains(
        searchTerm: string,
        query: Omit<DomainQuery, "organizationId" | "userId">,
    ): Promise<DomainListResponse> {
        const { page = 1, limit = 10, active } = query;
        const offset = (page - 1) * limit;

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

        return {
            domains: domains.map((domain) =>
                DomainService.formatDomainResponse(domain),
            ),
            total,
            page,
            limit,
        };
    }

    static async domainExists(domainName: string): Promise<boolean> {
        const result = await db
            .select({ domain: schema.domain.domain })
            .from(schema.domain)
            .where(eq(schema.domain.domain, domainName))
            .limit(1);

        return result.length > 0;
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
    }): DomainResponse {
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
