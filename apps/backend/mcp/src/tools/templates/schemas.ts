import * as z from "zod";
import type { Template } from "../../reloop/types";
import { resourceIdSchema } from "../contacts/schemas";

export const templateIdSchema = resourceIdSchema.describe(
	"Template ID as returned by list_templates",
);

export const templateSlugSchema = z
	.string()
	.trim()
	.min(1)
	.max(128)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
	.describe("Template slug, e.g. welcome-email, as returned by list_templates");

export const templateSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z
		.string()
		.describe(
			"Org-unique handle; send_email accepts it as template.slug instead of the ID",
		),
	description: z.string().nullable(),
	status: z.enum(["draft", "published", "archived"]),
	subject: z.string().nullable(),
	fromEmail: z.string().nullable(),
	replyTo: z.string().nullable(),
	previewText: z.string().nullable(),
	variables: z
		.array(
			z.object({
				name: z.string(),
				type: z.enum(["string", "number"]),
				defaultValue: z.string().nullable(),
			}),
		)
		.describe(
			"Variables to pass in send_email's template.variables, with the default value the template defines",
		),
	currentVersion: z.number().nullable(),
	thumbnailUrl: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toTemplateOutput(
	template: Template,
): z.output<typeof templateSchema> {
	return {
		id: template.id,
		name: template.name,
		slug: template.slug,
		description: template.description,
		status: template.status,
		subject: template.subject,
		fromEmail: template.fromEmail,
		replyTo: template.replyTo,
		previewText: template.previewText,
		variables: (template.variables ?? []).map((variable) => ({
			name: variable.name,
			type: variable.type,
			defaultValue: variable.defaultValue,
		})),
		currentVersion: template.currentVersion,
		thumbnailUrl: template.thumbnailUrl,
		createdAt: template.createdAt,
		updatedAt: template.updatedAt,
	};
}
