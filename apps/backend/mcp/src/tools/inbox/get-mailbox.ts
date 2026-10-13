import * as z from "zod";
import { defineTool } from "../define";
import { mailboxIdSchema, mailboxSchema, toMailboxOutput } from "./schemas";

export const getMailbox = defineTool({
	name: "get_mailbox",
	title: "Get mailbox",
	description:
		"Get one inbox mailbox by ID: its address, display name, status, and storage quota.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: mailboxIdSchema }),
	output: mailboxSchema.extend({ domainId: z.string().nullable() }),
	async run(args, api) {
		const mailbox = await api.inbox.retrieveMailbox(args.id);
		return { ...toMailboxOutput(mailbox), domainId: mailbox.domainId ?? null };
	},
});
