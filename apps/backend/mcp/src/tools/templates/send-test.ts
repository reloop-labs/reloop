import * as z from "zod";
import { emailSchema } from "../contacts/schemas";
import { defineTool } from "../define";
import { templateSchema as sendTemplateSchema } from "../email/schemas";
import { templateIdSchema } from "./schemas";

export const sendTestEmail = defineTool({
	name: "send_test_email",
	title: "Send test email",
	description:
		"Render a template with the given variables and send it as a test to one address, usually the user's own, to preview it in a real inbox. This sends a real email. Use send_email with `template` for real recipients.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z.object({
		templateId: templateIdSchema,
		to: emailSchema.describe("Single address to receive the test"),
		fromEmail: emailSchema
			.optional()
			.describe(
				"Sender on a verified domain; defaults to the template's sender",
			),
		subject: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.optional()
			.describe("Subject override; defaults to the template's subject"),
		variables: sendTemplateSchema.shape.variables,
	}),
	output: z.object({ sent: z.boolean() }),
	async run(args, api) {
		const response = await api.templates.sendTest(args.templateId, {
			to: args.to,
			fromEmail: args.fromEmail,
			subject: args.subject,
			variables: args.variables,
		});
		return { sent: response.success };
	},
});
