import * as z from "zod";
import { defineTool } from "../define";
import {
	sendingDomainSchema,
	smtpHostSchema,
	smtpPortSchema,
	smtpProviderSchema,
	smtpSecuritySchema,
	toSmtpProviderOutput,
} from "./schemas";

export const createSmtpProvider = defineTool({
	name: "create_smtp_provider",
	title: "Create SMTP provider",
	description:
		"Connect the user's own SMTP server (SendGrid, Postmark, Microsoft 365, their own Postfix…) and route a sending domain through it in one step. Reloop adds the domain automatically if it is not there yet; it needs no DNS records and can send immediately with all normal Reloop checks, logs, tracking, and webhooks. The connection is tested right away; check `status` and `lastError` in the result. Fails with `quota_exceeded` when the plan's provider limit is reached.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z.object({
		domain: sendingDomainSchema,
		host: smtpHostSchema,
		port: smtpPortSchema,
		security: smtpSecuritySchema.optional(),
		username: z.string().max(255).optional().describe("SMTP login"),
		password: z.string().max(1024).optional().describe("SMTP password"),
		name: z
			.string()
			.min(1)
			.max(100)
			.optional()
			.describe("Label for the server; defaults to the domain"),
	}),
	output: z.object({ provider: smtpProviderSchema }),
	async run(args, api) {
		const provider = await api.smtpProviders.create({
			domain: args.domain,
			host: args.host,
			port: args.port,
			security: args.security,
			username: args.username,
			password: args.password,
			name: args.name,
		});
		return { provider: toSmtpProviderOutput(provider) };
	},
});
