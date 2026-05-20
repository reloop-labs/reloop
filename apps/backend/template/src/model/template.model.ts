import { db } from "@reloop/db/client";
import type { TemplateBlock } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

export interface CreateTemplateInput {
	name: string;
	description?: string;
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	previewText?: string;
	organizationId: string;
	createdByUserId: string;
	content?: TemplateBlock[];
	variables?: string[];
}

export interface UpdateTemplateInput {
	id: string;
	name?: string;
	description?: string;
	subject?: string;
	fromEmail?: string;
	replyTo?: string;
	previewText?: string;
	content?: TemplateBlock[];
	variables?: string[];
	status?: "draft" | "published" | "archived";
	currentVersion?: number;
}

export const templateModel = {
	async create(input: CreateTemplateInput) {
		const [result] = await db
			.insert(schema.template)
			.values({
				name: input.name,
				description: input.description,
				subject: input.subject,
				fromEmail: input.fromEmail,
				replyTo: input.replyTo,
				previewText: input.previewText,
				organizationId: input.organizationId,
				createdByUserId: input.createdByUserId,
				content: input.content || [],
				variables: input.variables || [],
			})
			.returning();
		return result;
	},

	async findById(id: string) {
		const [result] = await db
			.select()
			.from(schema.template)
			.where(
				and(eq(schema.template.id, id), isNull(schema.template.deletedAt)),
			);
		return result;
	},

	async findByIdAndOrg(id: string, organizationId: string) {
		const [result] = await db
			.select()
			.from(schema.template)
			.where(
				and(
					eq(schema.template.id, id),
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
				),
			);
		return result;
	},

	async list(organizationId: string, page = 1, limit = 10) {
		const offset = (page - 1) * limit;

		const templates = await db
			.select()
			.from(schema.template)
			.where(
				and(
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
				),
			)
			.orderBy(desc(schema.template.createdAt))
			.limit(limit)
			.offset(offset);

		const [countResult] = await db
			.select({ count: schema.template.id })
			.from(schema.template)
			.where(
				and(
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
				),
			);

		return {
			templates,
			total: templates.length,
			page,
			limit,
		};
	},

	async update(input: UpdateTemplateInput) {
		const updateData: Partial<typeof schema.template.$inferInsert> = {};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.description !== undefined)
			updateData.description = input.description;
		if (input.subject !== undefined) updateData.subject = input.subject;
		if (input.fromEmail !== undefined) updateData.fromEmail = input.fromEmail;
		if (input.replyTo !== undefined) updateData.replyTo = input.replyTo;
		if (input.previewText !== undefined)
			updateData.previewText = input.previewText;
		if (input.content !== undefined) updateData.content = input.content;
		if (input.variables !== undefined) updateData.variables = input.variables;
		if (input.status !== undefined) updateData.status = input.status;
		if (input.currentVersion !== undefined)
			updateData.currentVersion = input.currentVersion;

		const [result] = await db
			.update(schema.template)
			.set(updateData)
			.where(eq(schema.template.id, input.id))
			.returning();

		return result;
	},

	async softDelete(id: string) {
		const [result] = await db
			.update(schema.template)
			.set({ deletedAt: new Date() })
			.where(eq(schema.template.id, id))
			.returning();
		return result;
	},

	async duplicate(id: string, organizationId: string, userId: string) {
		const original = await this.findByIdAndOrg(id, organizationId);
		if (!original) return null;

		const [result] = await db
			.insert(schema.template)
			.values({
				name: `${original.name} (Copy)`,
				description: original.description,
				subject: original.subject,
				organizationId,
				createdByUserId: userId,
				content: original.content,
				variables: original.variables,
				status: "draft",
			})
			.returning();

		return result;
	},
};
