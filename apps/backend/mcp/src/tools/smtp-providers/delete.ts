import * as z from "zod";
import { defineTool } from "../define";
import { smtpProviderIdSchema } from "./schemas";

export const deleteSmtpProvider = defineTool({
	name: "delete_smtp_provider",
	title: "Delete SMTP provider",
	description:
		"Permanently delete an SMTP provider by ID and its stored credentials. Domains that were added only for it are removed; domains that also have Reloop DNS records go back to sending through Reloop and need those records verified. Use list_smtp_providers to confirm the right provider first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: smtpProviderIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const result = await api.smtpProviders.remove(args.id);
		return { deleted: true as const, id: result.id };
	},
});
