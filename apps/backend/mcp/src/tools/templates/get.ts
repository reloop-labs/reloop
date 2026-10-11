import * as z from "zod";
import { defineTool } from "../define";
import { templateIdSchema, templateSchema, toTemplateOutput } from "./schemas";

export const getTemplate = defineTool({
	name: "get_template",
	title: "Get template",
	description:
		"Get one email template by ID: its subject, sender, status, and the variables it expects. The visual editor content is not returned; use send_test_email to see the rendered result. Returns a `template_not_found` error when no template matches.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: templateIdSchema }),
	output: z.object({ template: templateSchema }),
	async run(args, api) {
		return {
			template: toTemplateOutput(await api.templates.retrieve(args.id)),
		};
	},
});
