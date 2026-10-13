import * as z from "zod";
import { defineTool } from "../define";
import { mailboxSchema, toMailboxOutput } from "./schemas";

export const listMailboxes = defineTool({
	name: "list_mailboxes",
	title: "List mailboxes",
	description:
		"List the inbox mailboxes of the authenticated Reloop organization: the addresses that receive email in Reloop and can send replies. Call this first when the user asks about received email, their inbox, or which addresses they have, then pass a mailbox `id` to list_inbox_messages, list_inbox_threads, or send_mailbox_email.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({}),
	output: z.object({ mailboxes: z.array(mailboxSchema) }),
	async run(_args, api) {
		const mailboxes = await api.inbox.listMailboxes();
		return { mailboxes: mailboxes.map(toMailboxOutput) };
	},
});
