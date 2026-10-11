import * as z from "zod";
import { defineTool } from "../define";
import { emailIdSchema } from "./log-schemas";

export const resendEmail = defineTool({
	name: "resend_email",
	title: "Resend email",
	description:
		"Send a previously sent email again, by its log ID, with the same sender, recipients, subject, and body. This delivers a real, new email immediately and cannot be recalled, so confirm with the user first; check list_emails or get_email to make sure the original did not already arrive. Returns the new email log `id`. Fails with `email_not_found` when the ID does not exist.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z.object({ id: emailIdSchema }),
	output: z.object({
		id: z.string().describe("Log ID of the new email"),
		messageId: z.string(),
		status: z.string(),
		timestamp: z.string(),
	}),
	async run(args, api) {
		const response = await api.mail.resend(args.id);
		return {
			id: response.id,
			messageId: response.messageId,
			status: response.status,
			timestamp: response.timestamp,
		};
	},
});
