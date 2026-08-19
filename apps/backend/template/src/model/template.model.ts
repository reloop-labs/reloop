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
	variables?: schema.TemplateVariable[];
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
	variables?: schema.TemplateVariable[];
	status?: "draft" | "published" | "archived";
	currentVersion?: number;
	thumbnailUrl?: string | null;
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
		if (input.thumbnailUrl !== undefined)
			updateData.thumbnailUrl = input.thumbnailUrl;

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
				thumbnailUrl: original.thumbnailUrl,
				status: "draft",
			})
			.returning();

		return result;
	},
};

import { t } from "elysia";

export const templateResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	description: t.Union([t.String(), t.Null()]),
	subject: t.Union([t.String(), t.Null()]),
	fromEmail: t.Union([t.String(), t.Null()]),
	replyTo: t.Union([t.String(), t.Null()]),
	previewText: t.Union([t.String(), t.Null()]),
	organizationId: t.String(),
	createdByUserId: t.String(),
	status: t.Union([
		t.Literal("draft"),
		t.Literal("published"),
		t.Literal("archived"),
	]),
	content: t.Array(t.Any()),
	variables: t.Union([
		t.Array(
			t.Object({
				name: t.String(),
				type: t.Union([t.Literal("string"), t.Literal("number")]),
				defaultValue: t.Union([t.String(), t.Null()]),
			}),
		),
		t.Null(),
	]),
	currentVersion: t.Union([t.Number(), t.Null()]),
	thumbnailUrl: t.Union([t.String(), t.Null()]),
	isDefault: t.Boolean(),
	deletedAt: t.Union([t.Date(), t.Null()]),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});

export const templateVersionResponseSchema = t.Object({
	id: t.String(),
	templateId: t.String(),
	version: t.Number(),
	name: t.Union([t.String(), t.Null()]),
	isMajor: t.Boolean(),
	subject: t.Union([t.String(), t.Null()]),
	fromEmail: t.Union([t.String(), t.Null()]),
	replyTo: t.Union([t.String(), t.Null()]),
	previewText: t.Union([t.String(), t.Null()]),
	description: t.Union([t.String(), t.Null()]),
	content: t.Array(t.Any()),
	variables: t.Union([
		t.Array(
			t.Object({
				name: t.String(),
				type: t.Union([t.Literal("string"), t.Literal("number")]),
				defaultValue: t.Union([t.String(), t.Null()]),
			}),
		),
		t.Null(),
	]),
	renderedHtml: t.Union([t.String(), t.Null()]),
	createdByUserId: t.String(),
	createdBy: t.Optional(
		t.Object({
			id: t.String(),
			name: t.Union([t.String(), t.Null()]),
			email: t.String(),
			image: t.Union([t.String(), t.Null()]),
		}),
	),
	createdAt: t.Date(),
});
