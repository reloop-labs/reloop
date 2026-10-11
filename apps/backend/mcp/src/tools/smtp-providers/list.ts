import * as z from "zod";
import { defineTool } from "../define";
import { smtpProviderSchema, toSmtpProviderOutput } from "./schemas";

export const listSmtpProviders = defineTool({
	name: "list_smtp_providers",
	title: "List SMTP providers",
	description:
		"List the organization's own SMTP servers (bring your own SMTP) with the sending domains relayed through each and the last connection test result. Passwords are never returned. `limit` is the plan's cap on providers (null means unlimited).",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({}),
	output: z.object({
		providers: z.array(smtpProviderSchema),
		limit: z.number().nullable(),
	}),
	async run(_args, api) {
		const result = await api.smtpProviders.list();
		return {
			providers: result.items.map(toSmtpProviderOutput),
			limit: result.limit,
		};
	},
});
