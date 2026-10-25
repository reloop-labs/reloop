import { TemplateErrors } from "@be/template/error/template.error";
import {
	isTemplateSlugConflict,
	uniqueTemplateSlug,
} from "@be/template/utils/slug";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	type CursorPosition,
	cursorOrderBy,
	toCursorPage,
} from "@reloop/db/pagination";
import type { TemplateBlock } from "@reloop/db/schema";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const SLUG_RETRIES = 5;

/**
 * Insert with an org-unique slug. An explicit slug that's taken is a 409; a
 * generated one is regenerated when a concurrent insert grabbed it first.
 */
async function insertWithSlug(
	values: Omit<typeof schema.template.$inferInsert, "slug">,
	explicitSlug?: string,
) {
	for (let attempt = 0; ; attempt++) {
		const slug =
			explicitSlug ??
			(await uniqueTemplateSlug(values.organizationId, values.name));
		try {
			const [result] = await db
				.insert(schema.template)
				.values({ ...values, slug })
				.returning();
			return result;
		} catch (error) {
			if (!isTemplateSlugConflict(error)) throw error;
			if (explicitSlug) throw TemplateErrors.slugTaken(explicitSlug);
			if (attempt >= SLUG_RETRIES) throw error;
		}
	}
}

export interface CreateTemplateInput {
	name: string;
	/** Omit to derive from the name */
	slug?: string;
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
	slug?: string;
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
		return insertWithSlug(
			{
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
			},
			input.slug,
		);
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

	async findBySlugAndOrg(slug: string, organizationId: string) {
		const [result] = await db
			.select()
			.from(schema.template)
			.where(
				and(
					eq(schema.template.slug, slug),
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
				),
			);
		return result;
	},

	async hasPublishedVersion(templateId: string) {
		const [row] = await db
			.select({ id: schema.templateVersion.id })
			.from(schema.templateVersion)
			.where(
				and(
					eq(schema.templateVersion.templateId, templateId),
					eq(schema.templateVersion.isMajor, true),
				),
			)
			.limit(1);
		return !!row;
	},

	async list(
		organizationId: string,
		page = 1,
		limit = 10,
		position: CursorPosition | null = null,
	) {
		const offset = position ? 0 : (page - 1) * limit;

		const rows = await db
			.select()
			.from(schema.template)
			.where(
				and(
					eq(schema.template.organizationId, organizationId),
					isNull(schema.template.deletedAt),
					position ? afterCursor(schema.template, position) : undefined,
				),
			)
			.orderBy(...cursorOrderBy(schema.template))
			.limit(limit + 1)
			.offset(offset);
		const { items: templates, hasMore, nextCursor } = toCursorPage(rows, limit);

		return {
			templates,
			total: templates.length,
			page,
			limit,
			hasMore,
			nextCursor,
		};
	},

	async update(input: UpdateTemplateInput) {
		const updateData: Partial<typeof schema.template.$inferInsert> = {};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.slug !== undefined) updateData.slug = input.slug;
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

		try {
			const [result] = await db
				.update(schema.template)
				.set(updateData)
				.where(eq(schema.template.id, input.id))
				.returning();

			return result;
		} catch (error) {
			if (input.slug !== undefined && isTemplateSlugConflict(error)) {
				throw TemplateErrors.slugTaken(input.slug);
			}
			throw error;
		}
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

		return insertWithSlug({
			name: `${original.name} (Copy)`,
			description: original.description,
			subject: original.subject,
			organizationId,
			createdByUserId: userId,
			content: original.content,
			variables: original.variables,
			thumbnailUrl: original.thumbnailUrl,
			status: "draft",
		});
	},
};

import { t } from "elysia";

export const templateResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	slug: t.String(),
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
