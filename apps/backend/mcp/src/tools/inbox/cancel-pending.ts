import * as z from "zod";
import { resourceIdSchema } from "../contacts/schemas";
import { defineTool } from "../define";

export const cancelPendingMailboxSend = defineTool({
	name: "cancel_pending_mailbox_send",
	title: "Cancel pending mailbox send",
	description:
		"Cancel a send_mailbox_email that is still pending because it was scheduled or has an undo window. Pass the `id` that send_mailbox_email returned with status `pending`. Fails once the email has gone out.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: resourceIdSchema.describe("Pending send ID from send_mailbox_email"),
	}),
	output: z.object({ cancelled: z.literal(true), id: z.string() }),
	async run(args, api) {
		await api.inbox.cancelPending(args.id);
		return { cancelled: true as const, id: args.id };
	},
});
