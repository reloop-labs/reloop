import type { TemplateBlock } from "@reloop/db/schema";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, desc, eq } from "drizzle-orm";

export interface CreateVersionInput {
    templateId: string;
    version: number;
    subject?: string;
    content: TemplateBlock[];
    variables?: string[];
    renderedHtml?: string;
    createdByUserId: string;
}

export const templateVersionModel = {
    async create(input: CreateVersionInput) {
        const [result] = await db
            .insert(schema.templateVersion)
            .values({
                templateId: input.templateId,
                version: input.version,
                subject: input.subject,
                content: input.content,
                variables: input.variables || [],
                renderedHtml: input.renderedHtml,
                createdByUserId: input.createdByUserId,
            })
            .returning();
        return result;
    },

    async findByTemplateAndVersion(templateId: string, version: number) {
        const [result] = await db
            .select()
            .from(schema.templateVersion)
            .where(
                and(
                    eq(schema.templateVersion.templateId, templateId),
                    eq(schema.templateVersion.version, version),
                ),
            );
        return result;
    },

    async listByTemplate(templateId: string) {
        const versions = await db
            .select()
            .from(schema.templateVersion)
            .where(eq(schema.templateVersion.templateId, templateId))
            .orderBy(desc(schema.templateVersion.version));
        return versions;
    },

    async getLatestVersion(templateId: string) {
        const [result] = await db
            .select()
            .from(schema.templateVersion)
            .where(eq(schema.templateVersion.templateId, templateId))
            .orderBy(desc(schema.templateVersion.version))
            .limit(1);
        return result;
    },

    async getNextVersionNumber(templateId: string) {
        const latest = await this.getLatestVersion(templateId);
        return latest ? latest.version + 1 : 1;
    },
};
