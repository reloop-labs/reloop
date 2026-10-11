import * as z from "zod";
import { defineTool } from "../define";
import { templateSchema, toTemplateOutput } from "./schemas";

export const listTemplates = defineTool({
	name: "list_templates",
	title: "List templates",
	description:
		"List the email templates of the authenticated Reloop organization with their subject, sender, status, and variables, with offset pagination. Use this to find a template ID and the variables it expects before send_email with `template`.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.describe("Templates per page, 1 to 100"),
	}),
	output: z.object({
		templates: z.array(templateSchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int(),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.templates.list({
			page: args.page,
			limit: args.limit,
		});
		return {
			templates: response.templates.map(toTemplateOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
