import type * as schema from "@reloop/db/schema";

export namespace TemplateTypes {
	export type Template = typeof schema.template.$inferSelect;
	export type TemplateInsert = typeof schema.template.$inferInsert;
	export type TemplateVersion = typeof schema.templateVersion.$inferSelect;
	export type TemplateVersionInsert =
		typeof schema.templateVersion.$inferInsert;

	export interface TemplateListResponse {
		templates: Template[];
		total: number;
		page: number;
		limit: number;
	}

	export interface CreateTemplateBody {
		name: string;
		description?: string;
		subject?: string;
		content?: unknown[];
	}

	export interface UpdateTemplateBody {
		name?: string;
		description?: string;
		subject?: string;
		content?: unknown[];
		variables?: schema.TemplateVariable[];
		status?: "draft" | "published" | "archived";
	}

	export interface RenderTemplateBody {
		variables?: Record<string, string>;
	}
}
