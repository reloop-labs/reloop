import { db } from "@reloop/db/client";
import type { TemplateBlock } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, desc, eq } from "drizzle-orm";

export interface CreateVersionInput {
	templateId: string;
	version: number;
	name?: string;
	isMajor?: boolean;
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	previewText?: string;
	description?: string;
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
				name: input.name,
				isMajor: input.isMajor ?? false,
				subject: input.subject,
				fromEmail: input.fromEmail,
				replyTo: input.replyTo,
				previewText: input.previewText,
				description: input.description,
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
		const versions = await db.query.templateVersion.findMany({
			where: (tv, { eq }) => eq(tv.templateId, templateId),
			orderBy: (tv, { desc }) => [desc(tv.version)],
			with: {
				createdBy: {
					columns: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
			},
		});
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

	async findById(id: string) {
		const [result] = await db
			.select()
			.from(schema.templateVersion)
			.where(eq(schema.templateVersion.id, id));
		return result;
	},

	async delete(id: string) {
		const [result] = await db
			.delete(schema.templateVersion)
			.where(eq(schema.templateVersion.id, id))
			.returning();
		return result;
	},

	async countDraftsByTemplate(templateId: string) {
		const results = await db
			.select()
			.from(schema.templateVersion)
			.where(
				and(
					eq(schema.templateVersion.templateId, templateId),
					eq(schema.templateVersion.isMajor, false),
				),
			);
		return results.length;
	},

	async countPublishedByTemplate(templateId: string) {
		const results = await db
			.select()
			.from(schema.templateVersion)
			.where(
				and(
					eq(schema.templateVersion.templateId, templateId),
					eq(schema.templateVersion.isMajor, true),
				),
			);
		return results.length;
	},
};
