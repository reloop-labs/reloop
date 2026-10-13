import * as z from "zod";
import { emailSchema } from "../contacts/schemas";
import { defineTool } from "../define";
import { templateSchema, toTemplateOutput } from "./schemas";

const VARIABLE_NAME = /^[A-Za-z0-9_]{1,50}$/;
const PLACEHOLDER = /\{\{\{\s*([A-Za-z0-9_]{1,50})\s*\}\}\}/g;

export function findPlaceholders(html: string): string[] {
	return [
		...new Set(Array.from(html.matchAll(PLACEHOLDER), (m) => m[1])),
	].filter((name): name is string => name !== undefined);
}

export const createTemplate = defineTool({
	name: "create_template",
	title: "Create template",
	description:
		"Save a complete HTML email as a reusable Reloop template, so it can be sent by ID with send_email's `template` and edited later in the Reloop editor. Write the full email yourself as email-safe HTML (tables and inline styles, no scripts, 600px wide) and put per-recipient values in triple braces, for example {{{first_name}}} or {{{order_url}}}. Double braces are not substituted. Placeholders found in the HTML become template variables; pass `variables` to give them defaults. By default the template is published and ready to send; set `publish` to false to save it as a draft for review. Returns the template with its ID and variables.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		name: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.describe(
				"Template name shown in the dashboard, e.g. Order confirmation",
			),
		subject: z
			.string()
			.trim()
			.min(1)
			.max(500)
			.describe("Subject line; may contain {{{variables}}}"),
		html: z
			.string()
			.min(1)
			.max(500_000)
			.describe("The full email as an HTML document"),
		previewText: z
			.string()
			.max(500)
			.optional()
			.describe("Inbox preview text shown after the subject"),
		description: z
			.string()
			.max(500)
			.optional()
			.describe("What the template is for, shown in the dashboard"),
		fromEmail: emailSchema
			.optional()
			.describe("Default sender on a verified domain"),
		replyTo: emailSchema.optional().describe("Default reply-to address"),
		variables: z
			.array(
				z.object({
					name: z
						.string()
						.regex(VARIABLE_NAME)
						.describe("Placeholder name without braces, e.g. first_name"),
					type: z.enum(["string", "number"]).default("string"),
					defaultValue: z
						.string()
						.max(2000)
						.nullable()
						.default(null)
						.describe("Used when send_email leaves the variable out"),
				}),
			)
			.max(100)
			.optional()
			.describe(
				"Defaults for placeholders in the HTML. Placeholders not listed here are added with no default.",
			),
		publish: z
			.boolean()
			.default(true)
			.describe(
				"Publish so send_email can use the template now; false saves a draft",
			),
	}),
	output: z.object({ template: templateSchema, published: z.boolean() }),
	async run(args, api) {
		const declared = new Map(
			(args.variables ?? []).map((variable) => [variable.name, variable]),
		);
		const variables = [
			...declared.values(),
			...findPlaceholders(`${args.subject}\n${args.html}`)
				.filter((name) => !declared.has(name))
				.map((name) => ({
					name,
					type: "string" as const,
					defaultValue: null,
				})),
		];

		const content = [
			{ id: crypto.randomUUID(), type: "html", props: {}, html: args.html },
		];

		const created = await api.templates.create({
			name: args.name,
			description: args.description,
			subject: args.subject,
			fromEmail: args.fromEmail,
			replyTo: args.replyTo,
			content,
		});

		await api.templates.createVersion(created.id, {
			name: "Created by AI assistant",
			content,
			renderedHtml: args.html,
			subject: args.subject,
			previewText: args.previewText,
			variables,
			isMajor: args.publish,
		});

		return {
			template: toTemplateOutput(await api.templates.retrieve(created.id)),
			published: args.publish,
		};
	},
});
